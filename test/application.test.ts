import MailerGateway from '../src/MailerGateway';
import AccountService, {
  AccountServiceProduction,
  RideServiceProduction,
  RideService,
} from '../src/application';
import { AccountDAODatabase, AccountDAOMemory } from '../src/resource';
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
  let rideService: RideService;
  let accountService: AccountService;
  let accountDAO: AccountDAOMemory;

  beforeEach(() => {
    accountService = new AccountServiceProduction(accountDAO);
    rideService = new RideServiceProduction({}, accountService);
  });

  test('Should request a ride correctly', async () => {
    const input = {
      accountId: 'str',
      from: {
        lat: -182718621,
        long: -8162771627,
      },
      to: {
        lat: -817281212,
        long: -9182812,
      },
    };
    const result = await rideService.requestRide(input);

    expect(true).toBe(true);
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
  test.only('Should throw an exception when an user is not a passenger and wants to request a ride - Mock sinon', async () => {
    const input = {
      account_id: 'non-exists', // use account_id to match the application code
    };

    const output = {
      is_passenger: false,
    };

    const mockAccountDAODatabase = sinon.mock(AccountDAODatabase.prototype);
    mockAccountDAODatabase
      .expects('getAccountById')
      .withArgs(input.account_id)
      .once()
      .returns(Promise.resolve(output));

    await expect(rideService.requestRide(input)).rejects.toThrow(
      'User can not request a ride because they are not a passenger'
    );

    mockAccountDAODatabase.verify();
    mockAccountDAODatabase.restore();
  });
});
