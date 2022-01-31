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
let statementId: string;
let token: string

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    userId = uuidV4();
    statementId = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${userId}', 'Get Balance', 'john@getStatement.com', '${password}', NOW(), NOW())`
    );

    await connection.query(
      `INSERT INTO STATEMENTS(id, user_id, description, amount, type, created_at, updated_at) VALUES('${statementId}', '${userId}', 'Salary', 100, 'deposit', NOW(), NOW())`
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

  it("should be able get information about a existing statement", async () => {
    const response = await request(app)
      .get(`/api/v1/statements/${statementId}`)
      .send()
      .set('Authorization', `Bearer ${token}`)


    expect(response.status).toBe(200)
    expect(response.body.user_id).toBe(userId)
    expect(response.body.id).toBe(statementId)
    expect(response.body.type).toBe("deposit")
  })
})
