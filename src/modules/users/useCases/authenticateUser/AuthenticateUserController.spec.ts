import { hash } from 'bcryptjs';
import {v4 as uuidV4} from 'uuid'
import {Connection} from 'typeorm';
import createConnection from '../../../../database/index';
import request from 'supertest';
import { app } from '../../../../app';

let connection: Connection

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection()
    await connection.runMigrations()

    const id = uuidV4();
    const password = await hash("123456", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at) VALUES('${id}', 'John Doe', 'john@example.com', '${password}', NOW(), NOW())`
    );
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user", async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: "john@example.com",
      password: "123456"
    })

    expect(response.status).toBe(200)
    expect(response.body.user.name).toBe('John Doe')
    expect(response.body).toHaveProperty('token')
  })

})
