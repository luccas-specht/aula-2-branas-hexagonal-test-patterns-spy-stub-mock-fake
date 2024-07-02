import pgp from 'pg-promise';
import { createUrldbConnection } from './dbConnection';

export default interface AccountDAO {
  getAccountByEmail(email: string): Promise<any>;
  getAccountById(accountId: string): Promise<any>;
  saveAccount(account: any): Promise<void>;
}

export class AccountDAODatabase implements AccountDAO {
  async getAccountByEmail(email: string) {
    const connection = pgp()(
      createUrldbConnection({
        host: 'localhost',
        password: '231123',
        database: 'branas',
      })
    );
    const [account] = await connection.query(
      'select * from cccat17.account where email = $1',
      [email]
    );
    await connection.$pool.end();
    return account;
  }

  async getAccountById(accountId: string) {
    const connection = pgp()(
      createUrldbConnection({
        host: 'localhost',
        password: '231123',
        database: 'branas',
      })
    );
    const [account] = await connection.query(
      'select * from cccat17.account where account_id = $1',
      [accountId]
    );
    if (!account) {
      return undefined;
    }
    await connection.$pool.end();
    return { ...account, ...{ carPlate: account.car_plate } };
  }

  async saveAccount(account: any) {
    const connection = pgp()(
      createUrldbConnection({
        host: 'localhost',
        password: '231123',
        database: 'branas',
      })
    );
    await connection.query(
      'insert into cccat17.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)',
      [
        account.accountId,
        account.name,
        account.email,
        account.cpf,
        account.carPlate,
        !!account.isPassenger,
        !!account.isDriver,
      ]
    );
    await connection.$pool.end();
  }
}

export class AccountDAOMemory implements AccountDAO {
  accounts: any[];

  constructor() {
    this.accounts = [];
  }

  async getAccountByEmail(email: string): Promise<any> {
    return this.accounts.find((account: any) => account.email === email);
  }

  async getAccountById(accountId: string): Promise<any> {
    return this.accounts.find(
      (account: any) => account.accountId === accountId
    );
  }

  async saveAccount(account: any): Promise<void> {
    this.accounts.push(account);
  }
}

type Ride = {
  ride_id: string;
  passenger_id: string;
  status: string;
  fare: number;
  distance: number;
  from_lat: number;
  from_long: number;
  to_lat: number;
  to_long: number;
  date: any;
  driver_id: string | null;
};

export interface RideDAO {
  getRideByRideId(rideId: string): Promise<Ride | undefined>;
  getRideByPassengerId(passengerId: string): Promise<Ride[] | undefined>;
  saveRide(ride: Ride): Promise<void>;
}

export class RideDAODatabase implements RideDAO {
  async getRideByPassengerId(passengerId: string): Promise<any> {
    const connection = pgp()(
      createUrldbConnection({
        host: 'localhost',
        password: '231123',
        database: 'branas',
      })
    );
    const [ride] = await connection.query(
      'select * from cccat17.ride where passenger_id = $1',
      [passengerId]
    );
    await connection.$pool.end();
    return ride ?? undefined;
  }

  async getRideByRideId(rideId: string): Promise<any> {
    const connection = pgp()(
      createUrldbConnection({
        host: 'localhost',
        password: '231123',
        database: 'branas',
      })
    );
    const [ride] = await connection.query(
      'select * from cccat17.ride where ride_id  = $1',
      [rideId]
    );
    await connection.$pool.end();
    return ride ?? undefined;
  }

  async saveRide(ride: Ride): Promise<any> {
    const connection = pgp()(
      createUrldbConnection({
        host: 'localhost',
        password: '231123',
        database: 'branas',
      })
    );
    await connection.query(
      'insert into cccat17.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
        ride.ride_id,
        ride.passenger_id,
        null,
        'requested',
        ride.fare,
        ride.distance,
        ride.from_lat,
        ride.from_long,
        ride.to_lat,
        ride.to_long,
        ride.date,
      ]
    );
    await connection.$pool.end();
  }
}

export class RideDAOMemory implements RideDAO {
  accounts: Ride[];

  constructor() {
    this.accounts = [];
  }

  saveRide(ride: Ride): Promise<void> {
    return new Promise((resolve) => {
      this.accounts.push(ride);
      resolve();
    });
  }

  getRideByRideId(ride_id: string): Promise<Ride | undefined> {
    return new Promise((resolve) => {
      const ride = this.accounts.find((element) => element.ride_id === ride_id);
      resolve(ride);
    });
  }

  getRideByPassengerId(passenger_id: string): Promise<Ride[] | undefined> {
    return new Promise((resolve) => {
      const ride = this.accounts.filter(
        (element) => element.passenger_id === passenger_id
      );
      resolve(ride);
    });
  }
}
