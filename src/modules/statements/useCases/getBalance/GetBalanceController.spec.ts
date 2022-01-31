import { hash } from 'bcryptjs';
import {v4 as uuidV4} from 'uuid'
import {Connection} from 'typeorm';
import { sign } from 'jsonwebtoken';
import createConnection from '../../../../database/index';
import request from 'supertest';
import { app } from '../../../../app';
import authConfig from '../../../../config/auth';

let connection: Connection
let userId: string;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    userId = uuidV4();
    const statement_id = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${userId}', 'Get Balance', 'john@balance.com', '${password}', NOW(), NOW())`
    );

    await connection.query(
      `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at) VALUES('${statement_id}', '${userId}', 'Salary', 100, 'deposit', NOW(), NOW())`
    );
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get the account balance of an user", async () => {
    const query = await connection.query(`SELECT id, name, email, created_at, updated_at FROM USERS WHERE id = '${userId}'`)

    const { secret, expiresIn } = authConfig.jwt;
    const user = query[0];

    const token = sign({ user }, secret, {
      subject: user.id,
      expiresIn,
    });


    const response = await request(app)
      .get('/api/v1/statements/balance')
      .send()
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.balance).toEqual(100)
    expect(response.body).toHaveProperty('statement')
  })

})
