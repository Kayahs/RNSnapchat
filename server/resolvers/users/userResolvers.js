//if there a user only belongs to one team
module.exports = {
  User: {
    async teams(user, args, { app, req, postgres, authUtil }, info) {
      authUtil.authenticate(app, req)

      const teamsArray = await postgres.query({
        text: `SELECT * 
        from foostown.teams as teams
        inner join (SELECT users.fullname, t_u.team_id 
        from foostown.users as users
        inner join foostown.teams_users as t_u
        on users.id = t_u.user_id where users.id != $1) 
        as users_t_u
        on teams.id = users_t_u.team_id`,
        values: [user.id],
      })

      return teamsArray.rows
    },
    async stats(user, args, { app, req, postgres, authUtil }, info) {
      authUtil.authenticate(app, req)

      const userStats = await postgres.query({
        text: `
          SELECT
          SUM(teams_matches.goals_for) AS goals_for,
          SUM(teams_matches.goals_against) AS goals_against,
          COUNT(teams_matches.match_id) AS matches_played
          FROM foostown.teams_users AS teams_users
          LEFT JOIN foostown.teams_matches AS teams_matches
          ON teams_users.team_id = teams_matches.team_id 
          WHERE teams_users.user_id = $1
        `,
        values: [user.id],
      })

      if (userStats.rows[0].matches_played === '0') {
        return {
          goals_for: 0,
          goals_against: 0,
          matches_played: 0,
        }
      }

      return userStats.rows[0]
    },
  },
}

//if a user belongs to multiple teams
// module.exports = {
//   User: {
//     async teams(user, args, { req, postgres, authUtil }, info) {
//       // console.log("user: ", user)
//       const allUsersTeamsQuery = {
//         text: "SELECT * FROM foostown.teams_users WHERE team_id = $1",
//         values: [user.id]
//       };

//       const allTeams = await postgres.query(allUsersTeamsQuery);
//       console.log(allTeams.rows);

//       const teamIDsArray = await allTeams.rows.map(async team => {
//         console.log(team.team_id);

//         const teamsArrayQuery = {
//           text: "SELECT * FROM foostown.teams WHERE team_id = $1",
//           values: [team.team_id]
//         };

//         const teamsArray = await postgres.query(teamsArrayQuery);
//         console.log("teamsArray", teamsArray);

//         return teamsArray;
//       });

//       console.log("teamIDsArray", teamIDsArray);
//       return teamIDsArray;
//     }
//   }
// };
