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
let token: string

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    userId = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${userId}', 'Get Balance', 'john@statement.com', '${password}', NOW(), NOW())`
    );

    const query = await connection.query(`SELECT id, name, email, created_at, updated_at FROM USERS WHERE id = '${userId}'`)

    const { secret, expiresIn } = authConfig.jwt;
    const user = query[0];

    token = sign({ user }, secret, {
      subject: user.id,
      expiresIn,
    });
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to make a deposit", async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .send({
        amount: 100,
        description: "Deposit"
      })
      .set('Authorization', `Bearer ${token}`)


    expect(response.status).toBe(201)
    expect(response.body.user_id).toBe(userId)
    expect(response.body.type).toBe("deposit")
  })

  it("should be able to make a withdraw if there is enough funds", async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: "Withdraw"
      })
      .set('Authorization', `Bearer ${token}`)


    expect(response.status).toBe(201)
    expect(response.body.user_id).toBe(userId)
    expect(response.body.type).toBe("withdraw")
  })

  it("should not be able to make a withdraw if there isn't enough funds", async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .send({
        amount: 100,
        description: "Withdraw"
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("Insufficient funds")
  })

})
