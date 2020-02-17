const queryResolvers = require('./resolvers/query/queryResolvers')
const mutationResolvers = require('./resolvers/mutation/mutationResolvers')
const userResolvers = require('./resolvers/users/userResolvers')
const teamResolvers = require('./resolvers/teams/teamResolvers')
const organizationResolvers = require('./resolvers/organization/organizationResolvers')
const tournamentResolvers = require('./resolvers/tournaments/tournamentResolvers')

const { DateTime } = require('@okgrow/graphql-scalars')

module.exports = {
  DateTime,
  ...queryResolvers,
  ...mutationResolvers,
  ...userResolvers,
  ...teamResolvers,
  ...organizationResolvers,
  ...tournamentResolvers,
}
