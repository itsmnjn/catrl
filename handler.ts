('use strict');

import { DynamoDB } from 'aws-sdk';
import adjectives from './adjectives';
import felines from './felines';

const dynamoDB = new DynamoDB.DocumentClient();

const randStringFromList = (list: string[]): string => {
  const len = list.length;
  const randIndex = Math.floor(Math.random() * len);
  const randString = list[randIndex];

  return randString;
};
export const newCatrl = async (event) => {
  let response = {
    statusCode: 0,
    body: '',
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
    response.body = JSON.stringify(result);
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify(error);
    console.error(error);
  }

  return response;
};

export const getURL = async (event) => {
  let response = {
    statusCode: 0,
    body: '',
  };

  response.statusCode = 200;
  response.body = JSON.stringify(event.pathParameters.catrl);
  return response;
};
