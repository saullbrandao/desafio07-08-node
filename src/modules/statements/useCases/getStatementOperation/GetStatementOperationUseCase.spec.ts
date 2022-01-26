import { hash } from 'bcryptjs';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { OperationType } from '../createStatement/CreateStatementController';
import { GetStatementOperationError } from './GetStatementOperationError';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let usersRepository: InMemoryUsersRepository
let statementsRepository: InMemoryStatementsRepository
let getStatementOperationUseCase: GetStatementOperationUseCase

describe("Get Statement Operation", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  })

  it("should be able to get a statement operation", async () => {
    const password = await hash("123456", 8)

    const user = await usersRepository.create({
      email: "john@example.com",
      name: "John Doe",
      password
    })

    const deposit = await statementsRepository.create({
      user_id: user.id as string,
      type: "deposit" as OperationType,
      amount: 100,
      description: "Salary"
    })

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: deposit.id as string
    })

    expect(statementOperation).toHaveProperty("id")
    expect(statementOperation.user_id).toBe(user.id)
    expect(statementOperation.type).toBe("deposit")
    expect(statementOperation.amount).toBe(100)
  })

  it("should not be able to get a statement if the user does not exists", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "non-existing-user",
        statement_id: "non-existing-statement"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it("should not be able to get a statement if the statement does not exists", () => {

    expect(async () => {
      const password = await hash("123456", 8)

      const user  = await usersRepository.create({
        email: "john@example.com",
        name: "John Doe",
        password
      })

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "non-existing-statement"
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
