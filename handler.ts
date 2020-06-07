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

const generateCatrl = (): string => {
  const firstAdj = randStringFromList(adjectives);
  const secondAdj = randStringFromList(adjectives);
  const feline = randStringFromList(felines);
  const catrl = `${firstAdj}${secondAdj}${feline}`;

  return catrl;
};

const isObjEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const newCatrl = async (event) => {
  let response = {
    statusCode: 0,
    body: '',
  };

  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.url ||
    event.queryStringParameters.url === ''
  ) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: 'No URL passed.' });
    return response;
  }

  const urlRegExp: RegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

  if (!urlRegExp.test(event.queryStringParameters.url)) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: 'Invalid URL passed' });
  }

  let catrl: string = generateCatrl();

  const getParams = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      catrl,
    },
  };

  try {
    let result = (await dynamoDB.get(getParams).promise()) as any;

    while (!isObjEmpty(result)) {
      catrl = generateCatrl();
      getParams.Key.catrl = catrl;
      result = (await dynamoDB.get(getParams).promise()) as any;
    }

    const putParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        catrl,
        url: event.queryStringParameters.url,
      },
    };

    await dynamoDB.put(putParams).promise();

    response.statusCode = 200;
    response.body = JSON.stringify({ result: putParams.Item.catrl });
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error });

    console.error(error);
  }

  return response;
};

export const getURL = async (event) => {
  let response = {
    statusCode: 0,
    body: '',
  };

  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.catrl ||
    event.queryStringParameters.catrl === ''
  ) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: 'No catrl passed.' });
    return response;
  }

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      catrl: event.queryStringParameters.catrl,
    },
  };

  try {
    const result = (await dynamoDB.get(params).promise()) as any;

    if (isObjEmpty(result)) {
      response.statusCode = 404;
      response.body = JSON.stringify({ error: 'URL does not exist.' });
    } else {
      response.statusCode = 200;
      response.body = JSON.stringify({
        result: result.Item.url,
      });
    }
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error });

    console.error(error);
  }

  return response;
};
