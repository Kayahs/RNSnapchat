const jwt = require('jsonwebtoken')
const generateToken = require('./generateToken')

describe(generateToken, () => {
  let dateNowSpy
  beforeAll(() => {
    // Lock Time
    dateNowSpy = jest.spyOn(Date, 'now')
      .mockImplementation(() => 1487076708000);
  })

  afterAll(() => {
    // Unlock Time
    dateNowSpy.mockRestore();
  })

  it('generates a jwt token based on the date, csrf token and user id', () => {
    const user = { id: 5 }
    const secret = 'legit_secret'
    const expectedCSRFToken = 'also_very_legit'

    const now = () => 10000

    const result = generateToken(user, secret, expectedCSRFToken, now)

    const { userID, csrfToken, exp } = jwt.verify(result, secret)

    expect(typeof result).toEqual('string')
    expect(userID).toEqual(user.id)
    expect(csrfToken).toEqual(expectedCSRFToken)
    expect(exp).toEqual(Date.now() / 1000 + 2 * 60 * 60)
  })
})
