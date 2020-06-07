('use strict');

import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient();

export const hello = async (event) => {
  let response = {
    statusCode: 0,
    data: '',
  };

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      catrl: 'test',
    },
  };

  try {
    const result = await dynamoDB.put(params).promise();
    response.statusCode = 200;
    response.data = JSON.stringify(result);
  } catch (error) {
    response.statusCode = 500;
    response.data = JSON.stringify(error);
    console.error(error);
  }

  return response;
};
