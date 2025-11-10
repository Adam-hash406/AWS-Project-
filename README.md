# DCA Accommodation Booking App

This app allows Defence Cyber Academy personnel to book accommodation for training courses.

https://main.d3bmwp30z11q07.amplifyapp.com/ - here is a link to the site hosted within AWS Amplify 
on the backend the data is stored within a dynamodb database and within this usecase the accomidation office can then action each request from this database. Through the process i also configured lambda rules to collect the data from the site and sort it within the database, i also had to set up a API Gateway to link the lambda and dynamodb to the static site. 

## Features
- Personal and course details form
- AWS Amplify integration
- Lambda + API Gateway backend
- DynamoDB storage

## Setup
1. Clone the repo
2. Run `npm install`
3. Run `npm start`
4. Use Amplify CLI to add, API, and storage

## AWS Resources
- Lambda for form submission
- API Gateway for routing
- DynamoDB for storage
