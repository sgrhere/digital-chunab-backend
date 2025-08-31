# Digital Chunab - An Online Voting System

This is a backend application for a project Digital Chunab - An Online Voting System. Here users can vote for candidates. It provides functionalities for user authentication, candidate management, and voting.

## Role based features

1) Admin (Election Committee)
- Can signup once and login
- Can manage voters (add voters)
- Create new elections and positions (add, update, delete)
- Can manage candidates and assign to specific positions (add, update, delete)
- See the live vote count, list of positions & candidates

2) Voter
- Login using the credentials provided by the admin
- Change their password after logging in (Reset Password)
- See the list of candidates along with the positions (View ballot)
- Submit their vote for candidate (only once or more based on the position's criteria)
- Can see the live vote count and election updates

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Tokens (JWT) for authentication


# API Endpoints

## Authentication

### Sign Up
- `POST /signup`: Sign up for admin & add voter

### Login
- `POST /login`: Login a user (voter or admin)

## User Profile

### Get Profile
- `GET /user/profile`: Get user profile information

### Change Password
- `PUT /user/profile/password`: Change user password


## Candidates

### Get Candidates
- `GET /candidate`: Get the list of candidates (Both admin & voter)

### Add Candidate
- `POST /candidate`: Add a new candidate (Admin only)

### Update Candidate
- `PUT /candidate/:id`: Update a candidate by ID (Admin only)

### Delete Candidate
- `DELETE /candidate/:id`: Delete a candidate by ID (Admin only)

## Positions

### Get Position
- `GET /position`: Get the list of candidates (Both admin & voter)

### AddPosition
- `POST /position/add`: Add a new candidate (Admin only)

### UpdatePosition
- `PUT /position/:id`: Update a candidate by ID (Admin only)

### DeletePosition
- `DELETE /position/:id`: Delete a candidate by ID (Admin only)

## Voting

### Get Vote Count
- `GET /candidate/vote/count`: Get the count of votes for each candidate

### Vote for Candidate
- `POST /vote/:id`: Vote for a candidate (User only)
