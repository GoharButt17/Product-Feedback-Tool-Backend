// controllers/feedbackController.js
const getConnection = require('../utils/config/db');
const validateFeedback = require('../utils/helpers/validateFeedback/validateFeedback');
const validateAccessToken = require('../utils/helpers/validateAccessToken');
const validateComment = require('../utils/helpers/validateComment/validateComment');

module.exports = {
  submitFeedback: async function (req, res, next) {
    try {
      const { error } = validateFeedback(req.body);

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          result: false,
        });
      }

      const { title, description, category, user_id, rating } = req.body;

      // Check if rating is between 0 and 5
      if (rating < 0 || rating > 5) {
        return res.status(400).json({
          message: 'Rating should be between 0 and 5',
          result: false,
        });
      }

      // Check authentication token
      const token = req.header('x-access-token');
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing token' });
      }

      const isValid = validateAccessToken(token);
      if (!isValid) {
        return res.status(401).json({ message: 'Unauthorized - Invalid', result: false });
      }

      getConnection((err, connection) => {
        if (err) {
          res.status(500).send('Error connecting to the database');
          return;
        }

        // Check if the user exists
        const checkUserQuery = 'SELECT * FROM users WHERE user_id = ?';
        connection.query(checkUserQuery, [user_id], (err, userResults) => {
          if (err) {
            console.error('Error checking user existence:', err);
            res.status(500).json({
              message: 'Error checking user existence',
              result: false,
            });
            return;
          }

          if (userResults.length === 0) {
            // User with the specified ID doesn't exist
            res.status(404).json({
              message: 'User not found',
              result: false,
            });
            return;
          }

          // User exists, proceed to add the feedback
          const insertFeedbackQuery = `
            INSERT INTO feedback (title, description, category, user_id, rating)
            VALUES (?, ?, ?, ?, ?)
          `;

          // Execute the query
          connection.query(
            insertFeedbackQuery,
            [title, description, category, user_id, rating],
            (err, results) => {
              connection.release(); // Release the connection back to the pool

              if (err) {
                console.error('Error inserting feedback:', err);
                res.status(500).json({
                  message: 'Error inserting feedback',
                  result: false,
                });
                return;
              }

              res.status(200).json({
                message: 'Feedback submitted successfully',
                result: true,
              });
            }
          );
        });
      });
    } catch (e) {
      console.log('ERROR is', e);
      res.status(500).json({
        message: 'There was a problem submitting the feedback, please try again.',
        result: false,
      });
    }
  },
  getAllFeedback: async function (req, res, next) {
    try {
        // Check authentication token
        const token = req.header('x-access-token');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - Missing token' });
        }

        const isValid = validateAccessToken(token);
        if (!isValid) {
            return res.status(401).json({ message: 'Unauthorized - Invalid', result: false });
        }

        getConnection((err, connection) => {
            if (err) {
                res.status(500).send('Error connecting to the database');
                return;
            }

            // SQL query to retrieve all feedback records with user information
            const getAllFeedbackQuery = `
                SELECT feedback.*, users.firstname, users.lastname
                FROM feedback
                JOIN users ON feedback.user_id = users.user_id
            `;

            // Execute the query
            connection.query(getAllFeedbackQuery, (err, results) => {
                connection.release(); // Release the connection back to the pool

                if (err) {
                    console.error('Error retrieving feedback records:', err);
                    res.status(500).json({
                        message: 'Error retrieving feedback records',
                        result: false,
                    });
                    return;
                }

                res.status(200).json({
                    feedback: results,
                    result: true,
                });
            });
        });
    } catch (e) {
        console.log('ERROR is', e);
        res.status(500).json({
            message: 'There was a problem retrieving feedback records, please try again.',
            result: false,
        });
    }
},

  postComment: async function (req, res, next) {
    try {
      const { error } = validateComment(req.body);

      if (error) {
        return res.status(400).json({
          message: error.details[0].message,
          result: false,
        });
      }

      const { feedback_id, user_id, content } = req.body;

      // Check authentication token
      const token = req.header('x-access-token');
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing token' });
      }

      const isValid = validateAccessToken(token);
      if (!isValid) {
        return res.status(401).json({ message: 'Unauthorized - Invalid', result: false });
      }

      getConnection((err, connection) => {
        if (err) {
          res.status(500).send('Error connecting to the database');
          return;
        }

        // Check if the user exists
        const checkUserQuery = 'SELECT * FROM users WHERE user_id = ?';
        connection.query(checkUserQuery, [user_id], (err, userResults) => {
          if (err) {
            console.error('Error checking user existence:', err);
            res.status(500).json({
              message: 'Error checking user existence',
              result: false,
            });
            return;
          }

          if (userResults.length === 0) {
            // User with the specified ID doesn't exist
            res.status(404).json({
              message: 'User not found',
              result: false,
            });
            return;
          }

          // User exists, proceed to add the comment
          const insertCommentQuery = `
            INSERT INTO comment (feedback_id, user_id, content, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `;

          // Execute the query
          connection.query(
            insertCommentQuery,
            [feedback_id, user_id, content],
            (err, results) => {
              connection.release(); // Release the connection back to the pool

              if (err) {
                console.error('Error inserting comment:', err);
                res.status(500).json({
                  message: 'Error inserting comment',
                  result: false,
                });
                return;
              }

              res.status(200).json({
                message: 'Comment posted successfully',
                result: true,
              });
            }
          );
        });
      });
    } catch (e) {
      console.log('ERROR is', e);
      res.status(500).json({
        message: 'There was a problem posting the comment, please try again.',
        result: false,
      });
    }
  },
  getComments: async function (req, res, next) {
    try {
      // Check authentication token
      const token = req.header('x-access-token');
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized - Missing token' });
      }

      const isValid = validateAccessToken(token);
      if (!isValid) {
        return res.status(401).json({ message: 'Unauthorized - Invalid', result: false });
      }

      getConnection((err, connection) => {
        if (err) {
          res.status(500).send('Error connecting to the database');
          return;
        }

        // SQL query to retrieve all comments
        const getCommentsQuery = `
          SELECT comment.*, users.firstname AS FirstName, users.lastname AS LastName
          FROM comment
          INNER JOIN users ON comment.user_id = users.user_id
        `;

        // Execute the query
        connection.query(getCommentsQuery, (err, results) => {
          connection.release(); // Release the connection back to the pool

          if (err) {
            console.error('Error retrieving comments:', err);
            res.status(500).json({
              message: 'Error retrieving comments',
              result: false,
            });
            return;
          }

          res.status(200).json({
            comments: results,
            result: true,
          });
        });
      });
    } catch (e) {
      console.log('ERROR is', e);
      res.status(500).json({
        message: 'There was a problem retrieving comments, please try again.',
        result: false,
      });
    }
  },
};
