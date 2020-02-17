const { Query } = require('./queryResolvers')
const postgres = require('../postgres')

const app = {
  get: (key) => {
    if (key === 'SKIP_AUTH') {
      return true
    }
    return null
  }
}


describe("Query Resolvers", () => {
  describe(Query.teams, () => {
    // integration test

    describe('when a team exists for another organization', () => {
      it('does not return that team', async () => {
        const userRows = await postgres.query({
          text: 'INSERT INTO foostown.users (email, fullname, password) VALUES ($1, $2, $3) RETURNING *',
          values: ['me@me.com', '', '1234']
        })

        const orgRows = await postgres.query({
          text: 'INSERT INTO foostown.organizations (name, owner_id, is_active) VALUES ($1, $2, $3) RETURNING *',
          values: ['Giraffe Co 2', userRows.rows[0].id, true]
        })

        const organizationID = orgRows.rows[0].id

        await postgres.query({
          text: 'INSERT INTO foostown.teams (team_name, organization_id) VALUES ($1, $2)',
          values: ['the giraffes', organizationID]
        })

        const result = await Query.teams(null, { organizationID: organizationID + 1 }, { app, postgres })

        expect(result).toEqual([])
      })
    })
    
    it('SELECT teams from postgres', async () => {
        const userRows = await postgres.query({
          text: 'INSERT INTO foostown.users (email, fullname, password) VALUES ($1, $2, $3) RETURNING *',
          values: ['me2@me.com', '', '1234']
        })

        const orgRows = await postgres.query({
          text: 'INSERT INTO foostown.organizations (name, owner_id, is_active) VALUES ($1, $2, $3) RETURNING *',
          values: ['Giraffe Co', userRows.rows[0].id, true]
        })

      const organizationID = orgRows.rows[0].id

      await postgres.query({
        text: 'INSERT INTO foostown.teams (team_name, organization_id) VALUES ($1, $2)',
        values: ['the giraffes', organizationID]
      })

      const result = await Query.teams(null, { organizationID }, { postgres, app })

      expect(result.length).toEqual(1)
      expect(result[0].team_name).toEqual('the giraffes')
    })
  })
})