import MailerGateway from '../src/MailerGateway';
import AccountService, {
  AccountServiceProduction,
  RideServiceProduction,
  RideService,
} from '../src/application';
import {
  AccountDAODatabase,
  AccountDAOMemory,
  RideDAODatabase,
} from '../src/resource';
import sinon from 'sinon';

let accountService: AccountService;
let rideService: RideService;

describe.skip('Account', () => {
  beforeEach(() => {
    const accountDAO = new AccountDAODatabase();
    accountService = new AccountServiceProduction(accountDAO);
  });

  test('Deve criar uma conta de passageiro', async function () {
    const inputSignup = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    const outputSignup = await accountService.signup(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId
    );
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.cpf).toBe(inputSignup.cpf);
  });

  test('Deve criar uma conta de motorista', async function () {
    const inputSignup = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      carPlate: 'AAA9999',
      isDriver: true,
    };
    const outputSignup = await accountService.signup(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId
    );
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.cpf).toBe(inputSignup.cpf);
    expect(outputGetAccount.carPlate).toBe(inputSignup.carPlate);
  });

  test('Não deve criar uma conta de passageiro com nome inválido', async function () {
    const input = {
      name: '',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid name')
    );
  });

  test('Não deve criar uma conta de passageiro com email inválido', async function () {
    accountService = new AccountServiceProduction(new AccountDAOMemory());
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}`,
      cpf: '97456321558',
      isPassenger: true,
    };
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid email')
    );
  });

  test('Não deve criar uma conta de passageiro com cpf inválido', async function () {
    accountService = new AccountServiceProduction(new AccountDAOMemory());
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '9745632155810',
      isPassenger: true,
    };
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid cpf')
    );
  });

  test('Não deve criar uma conta de passageiro com email duplicado', async function () {
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    await accountService.signup(input);
    await expect(() => accountService.signup(input)).rejects.toThrowError(
      'Account already exists'
    );
  });

  test('Não deve criar uma conta de motorista com a placa inválida', async function () {
    accountService = new AccountServiceProduction(new AccountDAOMemory());
    const input = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      carPlate: 'AAA999',
      isDriver: true,
    };
    await expect(() => accountService.signup(input)).rejects.toThrow(
      new Error('Invalid car plate')
    );
  });

  test('Deve criar uma conta de passageiro com stub do MailerGateway', async function () {
    const stub = sinon.stub(MailerGateway.prototype, 'send').resolves();
    const inputSignup = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    const outputSignup = await accountService.signup(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId
    );
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.cpf).toBe(inputSignup.cpf);
    stub.restore();
  });

  test('Deve criar uma conta de passageiro com stub do AccountDAO', async function () {
    const inputSignup = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    const stubSaveAccount = sinon
      .stub(AccountDAODatabase.prototype, 'saveAccount')
      .resolves();
    const stubGetAccountByEmail = sinon
      .stub(AccountDAODatabase.prototype, 'getAccountByEmail')
      .resolves(undefined);
    const stubGetAccountById = sinon
      .stub(AccountDAODatabase.prototype, 'getAccountById')
      .resolves(inputSignup);
    const outputSignup = await accountService.signup(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId
    );
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.cpf).toBe(inputSignup.cpf);
    stubSaveAccount.restore();
    stubGetAccountByEmail.restore();
    stubGetAccountById.restore();
  });

  test('Deve criar uma conta de passageiro com fake do AccountDAO', async function () {
    accountService = new AccountServiceProduction(new AccountDAOMemory());
    const inputSignup = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    const outputSignup = await accountService.signup(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId
    );
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.cpf).toBe(inputSignup.cpf);
  });

  test('Deve criar uma conta de passageiro com spy no MailerGateway', async function () {
    const spySend = sinon.spy(MailerGateway.prototype, 'send');
    const inputSignup = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    const outputSignup = await accountService.signup(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId
    );
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.cpf).toBe(inputSignup.cpf);
    expect(spySend.calledOnce).toBe(true);
    expect(spySend.calledWith(inputSignup.email, 'Welcome!', '')).toBe(true);
    spySend.restore();
  });

  test('Deve criar uma conta de passageiro com mock no MailerGateway', async function () {
    const inputSignup = {
      name: 'John Doe',
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
    };
    const mockMailerGateway = sinon.mock(MailerGateway.prototype);
    mockMailerGateway
      .expects('send')
      .withArgs(inputSignup.email, 'Welcome!', '')
      .once()
      .callsFake(() => {
        console.log('abc');
      });
    const outputSignup = await accountService.signup(inputSignup);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await accountService.getAccount(
      outputSignup.accountId
    );
    expect(outputGetAccount.name).toBe(inputSignup.name);
    expect(outputGetAccount.email).toBe(inputSignup.email);
    expect(outputGetAccount.cpf).toBe(inputSignup.cpf);
    mockMailerGateway.verify();
    mockMailerGateway.restore();
  });
});

describe('Ride', () => {
  beforeEach(() => {
    const accountDAO = new AccountDAODatabase();
    const rideDAO = new RideDAODatabase();
    accountService = new AccountServiceProduction(accountDAO);
    rideService = new RideServiceProduction(rideDAO, accountService);
  });

  test('Should throw an exception when an accountId informed does not exists', async () => {
    const input = {
      accountId: 'str',
    };
    await expect(() => rideService.requestRide(input)).rejects.toThrow(
      new Error('Account does not exists')
    );
  });

  /**
   *  Tests approaches
   *  1 - First: create an user into real database, who is not a passenger
   *  2 - Second: create an user into fake(in memory) database who is not a passenger
   *      (create a database in memory for request application)
   *  3 - Third: Use a stub to simulate the call of accountDAO getAccountById and always return true
   *  4 - Fourth: Use a mock to mock this call and its response and create a mock response
   */
  test('Should throw an exception when an user is not a passenger and wants to request a ride - Mock sinon', async () => {
    const input = {
      passenger_id: 'non-exists',
    };

    const output = {
      is_passenger: false,
    };

    const mockAccountServiceProduction = sinon.mock(
      AccountServiceProduction.prototype
    );
    mockAccountServiceProduction
      .expects('getAccount')
      .withArgs(input.passenger_id)
      .once()
      .callsFake(() => {
        return output;
      });

    await expect(rideService.requestRide(input)).rejects.toThrow(
      'User can not request a ride because they are not a passenger'
    );

    mockAccountServiceProduction.verify();
    mockAccountServiceProduction.restore();
  });

  test('Should throw an exception when an user is not a passenger and wants to request a ride - Stub sinon', async () => {
    const input = {
      account_id: 'non-exists',
    };
    const output = {
      is_passenger: false,
    };

    const stubAccountService = sinon
      .stub(AccountServiceProduction.prototype, 'getAccount')
      .resolves(output);

    await expect(rideService.requestRide(input)).rejects.toThrow(
      'User can not request a ride because they are not a passenger'
    );
    stubAccountService.restore();
  });

  /**
   *  Tests approaches
   *  1 - first: go into real database and test it
   *  2 - second create a fake
   */
  test('Should throw an exception when an user has an uncompleted ride status - go into database', async () => {
    const createPassengerAccount = {
      name: 'does not matter',
      email: `doesNotMatter@gmail${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: false,
    };

    const requestARide = {
      from_lat: -29.9069906,
      from_long: -51.1720954,
      to_lat: -29.7282985,
      to_long: -51.157259,
    };

    const outputSignup = await accountService.signup(createPassengerAccount);
    expect(outputSignup.accountId).toBeDefined();

    await rideService.requestRide({
      ...requestARide,
      passenger_id: outputSignup.accountId,
    });

    await expect(
      rideService.requestRide({
        ...requestARide,
        passenger_id: outputSignup.accountId,
      })
    ).rejects.toThrow('Passenger still has a requested ride');
  });

  test('Should request a ride correctly', async () => {
    const createPassengerAccount = {
      name: 'does not matter',
      email: `doesNotMatter@gmail${Math.random()}@gmail.com`,
      cpf: '97456321558',
      isPassenger: true,
      isDriver: false,
    };

    const requestARide = {
      from_lat: -29.9069906,
      from_long: -51.1720954,
      to_lat: -29.7282985,
      to_long: -51.157259,
    };

    const outputSignup = await accountService.signup(createPassengerAccount);
    const outputRequestSide = await rideService.requestRide({
      ...requestARide,
      passenger_id: outputSignup.accountId,
    });

    expect(outputSignup.accountId).toBeDefined();
    expect(outputRequestSide.ride_id).toBeDefined();
  });
});
