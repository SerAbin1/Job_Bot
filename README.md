# Job Bot

  [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/SerAbin1/Job_Bot/blob/main/LICENSE) 
  [![Node.js](https://img.shields.io/badge/Node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)


# Automate Job Outsourcing with Job Bot

Job Bot is a Telegram Bot that automates the process of posting and assigning jobs to freelancers, reducing the need for manual intervention to a minimum. It is built using Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Users can only get access the jobs if they are a part of the Telegram group, which requires permission from the admin. Necessary vetting procedures can be put in place to ensure that only the right people get access to the jobs.

- **Job Posting**: Admins can post jobs through the bot, ensuring that the applicants only see the part of the job that needs concern them, thereby reducing the attack surface for any malicious activity like data leaks.
    - Control: Admins can decide who gets to see which details of the job, ensuring that the right people get the right information.
    - Security: Admins will get notified of any new applicants, and can configure the bot to immediately grant access to further details or, if required, vet the applicants before giving them access to the job details.
    - Efficiency: Admins can put in place measures to revoke someone's access to a job and reassign it to another if the job is not completed in the configured timeframe.

## Tech Stack

The Backend of the project is built using Node.js and Express to communicate with the Telegram API to handle job posting and applications. MongoDB is used to store the job details and track the applicants' and their information.

- **Node.js**: Node.js is an open-source, cross-platform, back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser.
- **Express**: Express is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **MongoDB**: MongoDB is a source-available cross-platform document-oriented database program.
