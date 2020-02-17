const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const Promise = require('bluebird')

const saltRounds = bcrypt.genSaltSync(12)

const signup = async (
  parent,
  { input: { fullname, email, password } },
  { req, app, postgres, authUtil }
) => {
  const hashedPassword = bcrypt.hashSync(password, 12)
  const emailLowerCase = email.toString().toLowerCase()
  const orgID = 1

  const newUserInsert = {
    text: 'INSERT INTO foostown.users (fullname, email, password) VALUES ($1, $2, $3) RETURNING *',
    values: [fullname, emailLowerCase, hashedPassword],
  }

  const client = await postgres.connect()

  try {
    // Begin postgres transaction
    await client.query('BEGIN')

    //Create New User
    const userResult = await postgres.query(newUserInsert)
    const user = userResult.rows[0]
    const csrfTokenBinary = await Promise.promisify(crypto.randomBytes)(32)
    const csrfToken = Buffer.from(csrfTokenBinary, 'binary').toString('base64')
    authUtil.setCookie({
      tokenName: app.get('JWT_COOKIE_NAME'),
      token: authUtil.generateToken(user, app.get('JWT_SECRET'), csrfToken),
      res: req.res,
    })

    //Create New Team
    const team = await postgres.query({
      text: 'INSERT INTO foostown.teams (team_name, organization_id) VALUES ($1, $2) RETURNING *',
      values: [email, orgID],
    })

    //Assign the Team for the User
    const userId = user.id
    const teamId = team.rows[0].id
    const assignTeamForUser = await postgres.query({
      text: 'INSERT INTO foostown.teams_users (user_id, team_id) VALUES ($1, $2) RETURNING *',
      values: [userId, teamId],
    })

    //Set role for the User in the Org
    const isAdmin = false
    const setRoleForUser = await postgres.query({
      text:
        'INSERT INTO foostown.organizations_users (organization_id, user_id, is_admin) VALUES ($1, $2, $3) RETURNING *',
      values: [orgID, userId, isAdmin],
    })

    // Commit the entire transaction!
    await client.query('COMMIT')
    console.log(user)
    return {
      user,
      csrfToken,
    }
  } catch (e) {
    // Something went wrong
    client.query('ROLLBACK', err => {
      if (err) {
        throw err
      }
      // release the client back to the pool
    })
    throw e
  }
}

module.exports = signup
