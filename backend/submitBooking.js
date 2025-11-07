const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  const params = {
    TableName: 'AccommodationBookings',
    Item: {
      id: Date.now().toString(),
      ...body
    }
  };

  await dynamo.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Booking saved successfully' })
  };
};
