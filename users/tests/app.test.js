// handler.test.js
const { handler } = require("../crudHandler/app"); // Adjust the import path as needed
const { mockClient } = require("aws-sdk-client-mock");
const {
  DynamoDBClient,
  BatchWriteItemCommand,
  DeleteItemCommand,
  ScanCommand,
  QueryCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");

const dynamoDBMock = mockClient(DynamoDBClient);

describe("Lambda Handler", () => {
  beforeEach(() => {
    dynamoDBMock.reset(); // Reset the mock before each test
  });

  test("POST: Successfully batch write items", async () => {
    const event = {
      httpMethod: "POST",
      body: [
        { height: 180, income: 50000 },
        { height: 175, income: 45000 },
      ],
    };

    dynamoDBMock.on(BatchWriteItemCommand).resolves({});

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: "Batch write successful",
    });
  });

  test("DELETE: Successfully delete an item", async () => {
    const event = {
      httpMethod: "DELETE",
      pathParameters: { id: "userId_1", age: "25" },
    };

    dynamoDBMock.on(DeleteItemCommand).resolves({});

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
  });

  test("GET: Successfully retrieve all items", async () => {
    const event = {
      httpMethod: "GET",
      path: "/all",
    };

    dynamoDBMock.on(ScanCommand).resolves({
      Items: [
        {
          userId: { S: "userId_1" },
          Age: { S: "25" },
          height: { N: "180" },
          income: { N: "50000" },
        },
      ],
      LastEvaluatedKey: null,
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
  });

  test("GET: Successfully retrieve an item by userId", async () => {
    const event = {
      httpMethod: "GET",
      path: "/{id}",
      resource: "/{id}",

      pathParameters: { id: "userId_1" },
    };

    dynamoDBMock.on(QueryCommand).resolves({
      Item: [
        {
          userId: { S: "userId_1" },
          Age: { S: "25" },
          height: { N: "180" },
          income: { N: "50000" },
        },
      ],
    });

    const response = await handler(event);
    // Parsing JSON string

    expect(response.body.result).toEqual({
      data: [{ userId: "userId_1", Age: "25", height: "180", income: "50000" }],
    });
  });

  test("PUT: Successfully update an item", async () => {
    const event = {
      httpMethod: "PUT",
      resource: "/{id}/{age}",
      pathParameters: { id: "userId_1", age: "25" },
      body: { height: "190", income: "60000" },
    };

    dynamoDBMock.on(UpdateItemCommand).resolves({
      Attributes: {
        userId: { S: "userId_1" },
        Age: { S: "25" },
        height: { N: "190" },
        income: { N: "60000" },
      },
    });

    const response = await handler(event);

    // expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual({
      userId: "userId_1",
      Age: "25",
      height: "190",
      income: "60000",
    });
  });
});
