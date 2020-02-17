const { Pool } = require('pg')
const squel = require('squel').useFlavour('postgres')
const config = require('../config/default.json')

const userSeeds = [
  {
    fullname: 'Rob Gilson',
    email: 'rob@rob.rob',
    password: '$2a$12$C3fzh/z1u9PpTxjEPsK1SefXVritcsDfcL6ftQzWSkfgouSKR6BfS',
  },
  {
    fullname: 'Jorrin Bruns',
    email: 'jorrin@jorrin.com',
    password: '$2a$12$C3fzh/z1u9PpTxjEPsK1SefXVritcsDfcL6ftQzWSkfgouSKR6BfS',
  },
  {
    fullname: 'Eirian Ta',
    email: 'eirian@eirian.com',
    password: '$2a$12$C3fzh/z1u9PpTxjEPsK1SefXVritcsDfcL6ftQzWSkfgouSKR6BfS',
  },
  {
    fullname: 'Akshay Manchanda',
    email: 'akshay@akshay.com',
    password: '$2a$12$C3fzh/z1u9PpTxjEPsK1SefXVritcsDfcL6ftQzWSkfgouSKR6BfS',
  },
  {
    fullname: 'Navi Hothi',
    email: 'navi@navi.com',
    password: '$2a$12$C3fzh/z1u9PpTxjEPsK1SefXVritcsDfcL6ftQzWSkfgouSKR6BfS',
  },
  {
    fullname: 'Vaughn Paulger',
    email: 'vaughn@vaughn.com',
    password: '$2a$12$C3fzh/z1u9PpTxjEPsK1SefXVritcsDfcL6ftQzWSkfgouSKR6BfS',
  },
]

const teamSeeds = [
  {
    team_name: 'Rob Gilson',
    organization_id: 1,
  },
  {
    team_name: 'Jorrin Bruns',
    organization_id: 1,
  },
  {
    team_name: 'Eirian Ta',
    organization_id: 1,
  },
  {
    team_name: 'Akshay Manchanda',
    organization_id: 1,
  },
  {
    team_name: 'Navi Hothi',
    organization_id: 1,
  },
  {
    team_name: 'Vaughn Paulger',
    organization_id: 1,
  },
]

const teamsUsersSeeds = [
  {
    user_id: 1,
    team_id: 1,
  },
  {
    user_id: 2,
    team_id: 2,
  },
  {
    user_id: 3,
    team_id: 3,
  },
  {
    user_id: 4,
    team_id: 4,
  },
  {
    user_id: 5,
    team_id: 5,
  },
  {
    user_id: 6,
    team_id: 6,
  },
]

const orgsUsersSeeds = [
  {
    organization_id: 1,
    user_id: 1,
    is_admin: true,
  },
  {
    organization_id: 1,
    user_id: 2,
    is_admin: true,
  },
  {
    organization_id: 1,
    user_id: 3,
    is_admin: true,
  },
  {
    organization_id: 1,
    user_id: 4,
    is_admin: true,
  },
  {
    organization_id: 1,
    user_id: 5,
    is_admin: true,
  },
  {
    organization_id: 1,
    user_id: 6,
    is_admin: true,
  },
]

const orgSeed = {
  name: 'RED Academy',
  owner_id: 1,
  is_active: true,
}

const matchesSeeds = [
  {
    organization_id: 1,
    tournament_id: null,
  },
  {
    organization_id: 1,
    tournament_id: null,
  },
  {
    organization_id: 1,
    tournament_id: null,
  },
  {
    organization_id: 1,
    tournament_id: null,
  },
  {
    organization_id: 1,
    tournament_id: null,
  },
  {
    organization_id: 1,
    tournament_id: null,
  },
]

const teamsMatchesSeeds = [
  {
    match_id: 1,
    team_id: 1,
    goals_for: 1,
    goals_against: 2,
  },
  {
    match_id: 1,
    team_id: 2,
    goals_for: 2,
    goals_against: 1,
  },
  {
    match_id: 2,
    team_id: 3,
    goals_for: 4,
    goals_against: 5,
  },
  {
    match_id: 2,
    team_id: 4,
    goals_for: 5,
    goals_against: 4,
  },
  {
    match_id: 3,
    team_id: 5,
    goals_for: 0,
    goals_against: 2,
  },
  {
    match_id: 3,
    team_id: 6,
    goals_for: 2,
    goals_against: 0,
  },
  {
    match_id: 4,
    team_id: 1,
    goals_for: 6,
    goals_against: 2,
  },
  {
    match_id: 4,
    team_id: 3,
    goals_for: 2,
    goals_against: 6,
  },
  {
    match_id: 5,
    team_id: 2,
    goals_for: 3,
    goals_against: 5,
  },
  {
    match_id: 5,
    team_id: 4,
    goals_for: 5,
    goals_against: 3,
  },
  {
    match_id: 6,
    team_id: 3,
    goals_for: 10,
    goals_against: 5,
  },
  {
    match_id: 6,
    team_id: 5,
    goals_for: 5,
    goals_against: 10,
  },
]

const seed = async () => {
  const pg = await new Pool(config.db).connect()

  try {
    await pg.query('BEGIN')

    console.log('Seeding Users...')

    await Promise.all(
      userSeeds.map(userSeed =>
        pg.query(
          squel
            .insert()
            .into('foostown.users')
            .setFields(userSeed)
            .toParam()
        )
      )
    )

    console.log('Seeding Users... [DONE]')
    console.log('Seeding Organizations...')

    const orgPromise = await pg.query(
      squel
        .insert()
        .into('foostown.organizations')
        .setFields(orgSeed)
        .toParam()
    )

    console.log('Seeding Organizations... [DONE]')
    console.log('Seeding Teams...')

    const teamsPromise = await Promise.all(
      teamSeeds.map(teamSeed =>
        pg.query(
          squel
            .insert()
            .into('foostown.teams')
            .setFields(teamSeed)
            .toParam()
        )
      )
    )

    console.log('Seeding Teams... [DONE]')
    console.log('Seeding Teams_Users...')

    const teamsUsersPromise = await Promise.all(
      teamsUsersSeeds.map(teamsUsersSeed =>
        pg.query(
          squel
            .insert()
            .into('foostown.teams_users')
            .setFields(teamsUsersSeed)
            .toParam()
        )
      )
    )

    console.log('Seeding Teams_Users... [DONE]')
    console.log('Seeding Orgs_Users...')

    const orgsUsersPromise = await Promise.all(
      orgsUsersSeeds.map(orgsUsersSeed =>
        pg.query(
          squel
            .insert()
            .into('foostown.organizations_users')
            .setFields(orgsUsersSeed)
            .toParam()
        )
      )
    )

    console.log('Seeding Orgs_Users... [DONE]')
    console.log('Seeding Matches...')

    await Promise.all(
      matchesSeeds.map(matchSeed =>
        pg.query(
          squel
            .insert()
            .into('foostown.matches')
            .setFields(matchSeed)
            .toParam()
        )
      )
    )

    console.log('Seeding Matches... [DONE]')
    console.log('Seeding Teams_Matches...')

    await Promise.all(
      teamsMatchesSeeds.map(teamsmatchSeed =>
        pg.query(
          squel
            .insert()
            .into('foostown.teams_matches')
            .setFields(teamsmatchSeed)
            .toParam()
        )
      )
    )

    console.log('Seeding Teams_Matches... [DONE]')

    await pg.query('COMMIT')
  } catch (e) {
    await pg.query('ROLLBACK')
    throw e
  } finally {
    pg.release()
  }
}

seed().catch(e => {
  setImmediate(() => {
    throw e
  })
})
