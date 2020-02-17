module.exports = {
  Organization: {
    async users(parent, { id }, { app, req, postgres, authUtil }, info) {
      authUtil.authenticate(app, req)

      const findUsersQuery = {
        text: 'SELECT * FROM foostown.users',
        values: [],
      }

      const users = await postgres.query(findUsersQuery)

      return users.rows
    },
    async tournaments(parent, { id }, { app, req, postgres, authUtil }, info) {
      authUtil.authenticate(app, req)

      const findTournamentsQuery = {
        text: 'SELECT * FROM foostown.tournaments WHERE tournaments.organization_id = $1',
        values: [parent.id],
      }

      const tournaments = await postgres.query(findTournamentsQuery)

      return tournaments.rows
    },
  },
}
