// import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
// import { mockClient } from "aws-sdk-client-mock"; // Mock library for AWS SDK V3

// handler.test.js
// const { DynamoDBClient, QueryCommand } = require("@aws-sdk/client-dynamodb");
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

  // test("GET: Successfully retrieve an item by userId", async () => {
  //   const event = {
  //     httpMethod: "GET",
  //     path: "/{id}",
  //     resource: "/{id}",

  //     pathParameters: { id: "userId_1" },
  //   };

  //   dynamoDBMock.on(QueryCommand).resolves({
  //     Item: [
  //       {
  //         userId: { S: "userId_1" },
  //         Age: { S: "25" },
  //         height: { N: "180" },
  //         income: { N: "50000" },
  //       },
  //     ],
  //   });

  //   const response = await handler(event);
  //   // Parsing JSON string

  //   expect(response.body.result).toEqual({
  //     data: [{ userId: "userId_1", Age: "25", height: "180", income: "50000" }],
  //   });
  // });

  // Import the necessary modules for testing
  // import { handler } from "./your-lambda-file"; // Import your Lambda handler function

  // Initialize the DynamoDBClient mock
  const ddbMock = mockClient(DynamoDBClient);

  describe("Test Lambda Handler", () => {
    beforeEach(() => {
      // Clear mock history before each test
      ddbMock.reset();
    });

    test("should return expected result from QueryCommand for /{id}", async () => {
      // Define the mock result that QueryCommand will return
      ddbMock.on(QueryCommand).resolves({
        Items: [
          {
            userId: { S: "userID_123" },
            Age: { S: "25" },
            height: { N: "180" },
            income: { N: "50000" },
          },
        ],
      });

      // Define the mock event with pathParameters for the {id} route
      const mockEvent = {
        resource: "/{id}",
        pathParameters: { id: "userID_123" },
        httpMethod: "GET",
      };

      // Call the Lambda handler with the mock event
      const response = await handler(mockEvent);

      // Parse the response body
      const responseBody = JSON.parse(response.body);

      // Ensure that the mock was called
      expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(1);

      // Ensure that the response is what we expect
      expect(response.statusCode).toBe(200);
      expect(responseBody.resultJSON).toEqual([
        {
          userId: "userID_123",
          Age: "25",
          height: "180",
          income: "50000",
        },
      ]);
    });

    // test("should handle error from QueryCommand for /{id}", async () => {
    //   // Mock an error scenario for the QueryCommand
    //   ddbMock.on(QueryCommand).rejects(new Error("Query failed"));

    //   // Define the mock event with pathParameters
    //   const mockEvent = {
    //     resource: "/{id}",
    //     pathParameters: { id: "userID_123" },
    //     httpMethod: "GET",
    //   };

    //   // Call the Lambda handler with the mock event
    //   const response = await handler(mockEvent);

    //   // Ensure that the status code is 500 due to the error
    //   expect(response.statusCode).toBe(500);

    //   // Parse the response body
    //   const responseBody = JSON.parse(response.body);
    //   expect(responseBody.message).toBe("Failed to retrieve item");
    //   expect(responseBody.error.message).toBe("Query failed");
    // });
  });

  // ----------------------------------

  test("PUT: Successfully update an item", async () => {
    const event = {
      httpMethod: "PUT",
      resource: "/{id}/{age}",
      pathParameters: { id: "userId_1", age: "25" },
      body: JSON.stringify({ height: 190, income: 60000 }), // Updated to match the number type
    };

    // Mocking UpdateItemCommand to return the updated attributes
    dynamoDBMock.on(UpdateItemCommand).resolves({
      Attributes: {
        userId: { S: "userId_1" },
        Age: { S: "25" },
        height: { N: "190" }, // Remains a string, but should represent a number
        income: { N: "60000" }, // Remains a string, but should represent a number
      },
    });

    // Call the Lambda handler with the mock event
    const response = await handler(event);

    // Ensure the response statusCode is 200
    expect(response.statusCode).toBe(200);

    // Parse the response body to access data
    const responseBody = JSON.parse(response.body);

    // Ensure the response data matches the mocked return data
    expect(responseBody.data).toEqual({
      userId: "userId_1",
      Age: "25",
      height: 190, // Expect height as a number
      income: 60000, // Expect income as a number
    });
  });
});
