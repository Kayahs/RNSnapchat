const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const saltRounds = 12
const crypto = require('crypto')
const Promise = require('bluebird')
const signup = require('./signup')

const calculateBrackets = nop => {
  if (nop == 1) {
    return 1
  }
  if (nop % 2 == 0) {
    return 1 + calculateBrackets(nop / 2)
  } else {
    return 1 + calculateBrackets((nop - 1) / 2)
  }
}

module.exports = {
  Mutation: {
    signup,

    async login(parent, { input: { email, password } }, { req, app, postgres, authUtil }) {
      const emailLowerCase = email.toString().toLowerCase()
      //Get User And Password For Verification
      const findUserQuery = {
        text: 'SELECT * FROM foostown.users WHERE email = $1',
        values: [emailLowerCase],
      }
      const userResult = await postgres.query(findUserQuery)
      const user = userResult.rows[0]
      if (!user) throw 'User was not found.'
      console.log(user)

      // -------------------------------
      if (user == null) throw 'User was not found.'
      const valid = bcrypt.compareSync(password, user.password)
      if (!valid) throw 'Incorrect user or email.'

      const csrfTokenBinary = await Promise.promisify(crypto.randomBytes)(32)
      const csrfToken = Buffer.from(csrfTokenBinary, 'binary').toString('base64')

      authUtil.setCookie({
        tokenName: app.get('JWT_COOKIE_NAME'),
        token: authUtil.generateToken(user, app.get('JWT_SECRET'), csrfToken),
        res: req.res,
      })

      return {
        user,
        csrfToken,
      }
    },

    async createMatch(
      parent,
      { input: { team_id, goals_for, goals_against, organization_id } },
      { req, app, postgres, authUtil }
    ) {
      const client = await postgres.connect()
      try {
        await client.query('BEGIN')
        const userID = authUtil.authenticate(app, req)
        const tournamentID = null
        const userTeamResult = await client.query({
          text: 'SELECT * FROM foostown.teams_users WHERE user_id = $1',
          values: [userID],
        })

        const userTeamID = userTeamResult.rows[0].team_id
        const newMatchResult = await client.query({
          text:
            'INSERT INTO foostown.matches (organization_id, tournament_id) VALUES ($1, $2) RETURNING *',
          values: [organization_id, tournamentID],
        })
        const matchID = newMatchResult.rows[0].id
        const createHomeEntryResult = await client.query({
          text:
            'INSERT INTO foostown.teams_matches (match_id, team_id, goals_for, goals_against) VALUES ($1, $2, $3, $4) RETURNING *',
          values: [matchID, userTeamID, goals_for, goals_against],
        })

        const createAwayEntryResult = await client.query({
          text:
            'INSERT INTO foostown.teams_matches (match_id, team_id, goals_for, goals_against) VALUES ($1,$2,$3,$4)',
          values: [matchID, team_id, goals_against, goals_for],
        })

        const matchResult = createHomeEntryResult.rows[0]
        await client.query('COMMIT')
        return matchResult
      } catch (e) {
        client.query('ROLLBACK', err => {
          if (err) {
            throw err
          }
        })
        throw e
      }
    },
    async logout(parent, {}, { app, req, postgres, authUtil }) {
      const cookieName = app.get('JWT_COOKIE_NAME')
      req.res.clearCookie(cookieName)
      return true
    },

    async createTournament(
      parent,
      { input: { tournament_name, number_of_players } },
      { req, app, postgres, authUtil }
    ) {
      const orgID = 1
      const status = 'open'
      const start_date = new Date().toISOString()

      const client = await postgres.connect()
      try {
        await client.query('BEGIN')

        //create entry on Tournaments Table
        const createTournamentMutation = {
          text: `
            INSERT INTO foostown.tournaments (tournament_name,
            organization_id, start_date, status)
            VALUES ($1, $2, $3, $4) RETURNING *
            `,
          values: [tournament_name, orgID, start_date, status],
        }
        const tournament = await postgres.query(createTournamentMutation)

        //Create entry in the Matches Tables for all matches that will be played in tourney

        const numberOfMatches = (number_of_players * (number_of_players - 1)) / 2 + 4 //+4 is for the elimination round matches

        for (let x = 0; x < numberOfMatches; x++) {
          const createTourneyMatchesMutation = {
            text: `
              INSERT into foostown.matches (organization_id, tournament_id) VALUES ($1, $2) RETURNING *
            `,
            values: [tournament.rows[0].organization_id, tournament.rows[0].id],
          }
          await postgres.query(createTourneyMatchesMutation)
        }

        //Create entries in the Teams_Tournaments Table
        for (let x = 0; x < number_of_players; x++) {
          const createTourneyTeamsMutation = {
            text: `
          INSERT INTO foostown.teams_tournaments (tournament_id, team_id, points) VALUES ($1, $2, $3)
          `,
            values: [tournament.rows[0].id, null, 0],
          }
          await postgres.query(createTourneyTeamsMutation)
        }

        await client.query('COMMIT')
        return tournament.rows[0]
      } catch (e) {
        client.query('ROLLBACK', err => {
          if (err) {
            throw err
          }
        })
        throw e
      }
    },
    async createEliminationTournament(
      parent,
      { input: { tournament_name, number_of_players } },
      { req, app, postgres, authUtil }
    ) {
      const orgID = 1
      const status = 'open'
      const start_date = new Date().toISOString()
      const client = await postgres.connect()
      try {
        const userID = authUtil.authenticate()
        await client.query('BEGIN')
        const createTournamentMutation = {
          text: `
            INSERT INTO foostown.tournaments (tournament_name,
            organization_id, start_date, status)
            VALUES ($1, $2, $3, $4) RETURNING *
            `,
          values: [tournament_name, orgID, start_date, status],
        }
        const tournament = await postgres.query(createTournamentMutation)
        const numberOfBrackets = calculateBrackets(number_of_players)
        console.log(numberOfBrackets)

        await client.query('COMMIT')
        return tournament.rows[0]
      } catch (e) {
        client.query('ROLLBACK', err => {
          if (err) {
            throw err
          }
        })
        throw e
      }
    },
    async closeTournament(parent, { id }, { req, app, postgres, authUtil }) {
      const end_date = new Date().toISOString()
      const status = 'closed'
      const updateTournamentStatus = await postgres.query({
        text: 'UPDATE foostown.tournaments SET end_date=$1, status=$2 WHERE id=$3 RETURNING *',
        values: [end_date, status, id],
      })
      console.log()
      console.log(end_date)
      console.log(status)
      console.log(updateTournamentStatus)
      return updateTournamentStatus.rows[0]
    },
    // async addTeamToTourney(parent, {}, { app, req, postgres, authUtil }) {

    //   const addTeamMutation = {
    //     text: `INSERT into foostown.teams_tournaments (tournament_id, team_id, points) VALUES(1,1,0)`,
    //     values: [id],
    //   }

    //   const user = await postgres.query(addTeamMutation)

    //   return true
    // },
  },
}
