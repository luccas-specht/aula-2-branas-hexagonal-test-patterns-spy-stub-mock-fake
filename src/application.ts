import crypto from 'crypto';
import { validateCpf } from './validateCpf';
import AccountDAO from './resource';
import MailerGateway from './MailerGateway';

export default interface AccountService {
  signup(input: any): Promise<any>;
  getAccount(accountId: any): Promise<any>;
}

export class AccountServiceProduction implements AccountService {
  accountDAO: AccountDAO;
  mailerGateway: MailerGateway;

  constructor(accountDAO: AccountDAO) {
    this.accountDAO = accountDAO;
    this.mailerGateway = new MailerGateway();
  }

  async signup(input: any): Promise<any> {
    const account = {
      accountId: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      cpf: input.cpf,
      carPlate: input.carPlate,
      isPassenger: input.isPassenger,
      isDriver: input.isDriver,
    };
    const existingAccount = await this.accountDAO.getAccountByEmail(
      input.email
    );
    if (existingAccount) throw new Error('Account already exists');
    if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/))
      throw new Error('Invalid name');
    if (!input.email.match(/^(.+)@(.+)$/)) throw new Error('Invalid email');
    if (!validateCpf(input.cpf)) throw new Error('Invalid cpf');
    if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/))
      throw new Error('Invalid car plate');
    await this.accountDAO.saveAccount(account);
    await this.mailerGateway.send(account.email, 'Welcome!', '');
    return {
      accountId: account.accountId,
    };
  }

  async getAccount(accountId: any): Promise<any> {
    const account = await this.accountDAO.getAccountById(accountId);
    return account;
  }
}

export interface RideService {
  requestRide(input: any): Promise<any>;
  getRide(input: any): Promise<any>;
}

export class RideServiceProduction implements RideService {
  rideService: any;
  accountService: AccountService;

  constructor(rideService: any, accountService: AccountService) {
    this.rideService = rideService;
    this.accountService = accountService;
  }

  async requestRide(input: any): Promise<any> {
    const ride = {
      passenger_id: input?.account_id,
      from_lat: input?.from?.lat,
      from_long: input?.from?.long,
      to_lat: input?.to?.lat,
      to_long: input.to?.long,
    };

    const account = await this.accountService.getAccount(ride.passenger_id);

    if (!account) {
      throw new Error('Account does not exists');
    }

    if (!account.is_passenger) {
      throw new Error(
        'User can not request a ride because they are not a passenger'
      );
    }
  }

  getRide(input: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
