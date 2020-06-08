import { S3, DynamoDB } from 'aws-sdk';
import adjectives from './adjectives';
import felines from './felines';
import * as fs from 'fs';
import * as path from 'path';

const dynamoDB = new DynamoDB.DocumentClient();
const s3 = new S3();

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
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: '',
  };

  if (
    !event.queryStringParameters ||
    !event.queryStringParameters.url ||
    event.queryStringParameters.url === ''
  ) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: 'Invalid URL.' });
    return response;
  }

  const urlRegExp: RegExp = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
  if (!urlRegExp.test(event.queryStringParameters.url)) {
    response.statusCode = 500;
    response.body = JSON.stringify({ error: 'Invalid URL.' });
    return response;
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
  let response: any = {
    statusCode: 0,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: '',
  };

  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      catrl: event.pathParameters.catrl,
    },
  };

  try {
    const result = (await dynamoDB.get(params).promise()) as any;

    if (isObjEmpty(result)) {
      response.statusCode = 404;
      response.body = JSON.stringify({ error: 'Invalid catrl' });
    } else {
      response.statusCode = 301;
      response.headers = {
        ...response.headers,
        Location: result.Item.url,
      };
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

export const getStatic = async (event) => {
  const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Access-Control-Allow-Origin': '*',
    },
    body: html,
  };
  return response;
};
