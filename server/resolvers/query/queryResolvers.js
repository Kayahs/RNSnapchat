module.exports = {
  Query: {
    async user(parent, { id }, { app, req, postgres, authUtil }, info) {
      authUtil.authenticate(app, req)
      const findUserQuery = {
        text: 'SELECT * FROM foostown.users WHERE id = $1',
        values: [id],
      }

      const user = await postgres.query(findUserQuery)

      if (user.rows.length < 1) {
        throw 'User does not exist'
      }
      return user.rows[0]
    },

    async organization(parent, { id }, { app, req, postgres, authUtil }, info) {
      authUtil.authenticate(app, req)
      const findOrgQuery = {
        text: 'SELECT * FROM foostown.organizations WHERE id = $1',
        values: [id],
      }

      const org = await postgres.query(findOrgQuery)

      if (org.rows.length < 1) {
        throw 'Organization does not exist'
      }
      return org.rows[0]
    },

    async viewer(parent, args, { req, app, postgres, authUtil }) {
      const userID = authUtil.authenticate(app, req)
      const findUserQuery = {
        text: 'SELECT * FROM foostown.users WHERE id = $1',
        values: [userID],
      }

      const user = await postgres.query(findUserQuery)
      return user.rows[0]
    },

    async teams(parent, { organizationID = 1 }, { req, app, postgres, authUtil }) {
      authUtil.authenticate(app, req)

      const teams = await postgres.query({
        text: 'SELECT * FROM foostown.teams WHERE organization_id = $1',
        values: [organizationID],
      })
      return teams.rows
    },

    async matchesPlayed(team, args, { app, req, postgres, authUtil }, info) {
      const userID = authUtil.authenticate(app, req)

      const teamsMatchesQuery = {
        text: `
          SELECT
          home_team.team_name as home_team,
          away_team.team_name as away_team,
          home.match_id as match_id,
          home.team_id as home_team_id,
          away.team_id as away_team_id,
          home.goals_for as home_goals,
          away.goals_for as away_goals
          FROM foostown.teams_matches AS home
          INNER JOIN foostown.teams_matches AS away
          ON away.match_id = home.match_id AND away.team_id != home.team_id
          INNER JOIN foostown.teams as home_team
          on home_team.id = home.team_id 
          INNER JOIN foostown.teams as away_team
          on away_team.id = away.team_id 
          WHERE home.team_id = $1
        `,
        values: [userID],
      }

      const matchesPlayed = await postgres.query(teamsMatchesQuery)

      return matchesPlayed.rows
    },
  },
}
