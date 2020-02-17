module.exports = {
  Tournament: {
    async teams(parent, { id }, { app, req, postgres, authUtil }, info) {
      authUtil.authenticate(app, req)

      const findTeamsQuery = {
        text: `
          SELECT teams_tournaments.tournament_id, teams_tournaments.points, teams.* 
          FROM foostown.teams_tournaments as teams_tournaments 
          INNER JOIN foostown.teams AS teams
          ON teams_tournaments.team_id = teams.id 
          WHERE teams_tournaments.tournament_id = $1`,
        values: [parent.id],
      }

      // console.log("tourney ID >>>", parent.id)

      const teams = await postgres.query(findTeamsQuery)

      console.log('teams>>> ', teams)

      return teams.rows
    },
  },
}
