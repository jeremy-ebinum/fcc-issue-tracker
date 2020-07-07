/* eslint-disable consistent-return */
/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

const mongoose = require("mongoose");
const { startOfDay, endOfDay } = require("date-fns");
const Issue = require("../models/Issue");
const { BadRequest } = require("../utils/errors");

const { MONGODB_URI } = process.env;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to DB");

    Issue.deleteMany().then(() => console.log("Resetting DB..."));
  })
  .catch((err) => {
    console.error(err);
  });

mongoose.connection.on("error", (err) => {
  console.err(err);
});

const isValidDate = (d) => {
  return d instanceof Date && Number.isFinite(d.getTime());
};

module.exports = (app) => {
  app
    .route("/api/issues/:project")

    .get(async (req, res, next) => {
      const _id = req.query._id ? { _id: req.query._id } : {};
      const issueTitle = req.query.issue_title
        ? { issue_title: req.query.issue_title }
        : {};
      const issueText = req.query.issue_text
        ? { issue_text: req.query.issue_text }
        : {};
      const createdBy = req.query.created_by
        ? { created_by: req.query.created_by }
        : {};
      const assignedTo = req.query.assigned_to
        ? { assigned_to: req.query.assigned_to }
        : {};
      const statusText = req.query.status_text
        ? { status_text: req.query.status_text }
        : {};
      const createdOn = isValidDate(req.query.created_on)
        ? {
            created_on: {
              $gte: startOfDay(new Date(req.query.created_on)),
              $lte: endOfDay(new Date(req.query.created_on)),
            },
          }
        : {};
      const updatedOn = isValidDate(req.query.updated_on)
        ? {
            updated_on: {
              $gte: startOfDay(new Date(req.query.updated_on)),
              $lte: endOfDay(new Date(req.query.updated_on)),
            },
          }
        : {};

      let open = {};

      if (typeof req.query.open === "string" && req.query.open === "true") {
        open = { open: true };
      } else if (
        typeof req.query.open === "string" &&
        req.query.open === "false"
      ) {
        open = { open: false };
      }

      try {
        const issues = await Issue.find({
          ..._id,
          ...issueTitle,
          ...issueText,
          ...createdBy,
          ...assignedTo,
          ...statusText,
          ...createdOn,
          ...updatedOn,
          ...open,
        });

        res.json(issues);
      } catch (err) {
        next(err);
      }
    })

    .post(async (req, res, next) => {
      const {
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText,
      } = req.body;

      try {
        if (!issueTitle || !issueText || !createdBy) {
          throw new BadRequest("Missing required fields");
        }

        const creationDate = new Date();

        const newIssue = new Issue({
          issue_title: issueTitle,
          issue_text: issueText,
          created_by: createdBy,
          assigned_to: assignedTo || "",
          status_text: statusText || "",
          created_on: creationDate,
          updated_on: creationDate,
          open: true,
        });

        const savedIssue = await newIssue.save();

        res.json(savedIssue);
      } catch (err) {
        next(err);
      }
    })

    .put(async (req, res, next) => {
      const {
        _id,
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText,
        open,
      } = req.body;

      try {
        if (!req.body || JSON.stringify(req.body) === "{}") {
          throw new BadRequest("No body");
        }

        if (!_id) throw new BadRequest("Missing required field: _id");

        if (
          !issueTitle &&
          !issueText &&
          !createdBy &&
          !assignedTo &&
          !statusText &&
          !open
        ) {
          return res.json("no updated field sent");
        }

        const issue = await Issue.findById(_id);

        if (!issue) {
          return res.json(`could not update ${_id}`);
        }

        if (typeof issueTitle !== "undefined" && issueTitle !== null) {
          issue.issue_title = String(issueTitle);
        }

        if (typeof issueText !== "undefined" && issueText !== null) {
          issue.issue_text = String(issueText);
        }

        if (typeof createdBy !== "undefined" && createdBy !== null) {
          issue.created_by = String(createdBy);
        }
        if (typeof assignedTo !== "undefined" && assignedTo !== null) {
          issue.assigned_to = String(assignedTo);
        }

        if (typeof statusText !== "undefined" && statusText !== null) {
          issue.status_text = String(statusText);
        }

        if (typeof open === "string") {
          if (open.toLowerCase() === "true") issue.open = true;
          else if (open.toLowerCase() === "false") issue.open = false;
        }

        issue.updated_on = new Date();

        await issue.save();
        res.json(`successfully updated ${_id}`);
      } catch (err) {
        next(err);
      }
    })

    .delete(async (req, res, next) => {
      const { _id } = req.body;

      if (!_id) return res.status(400).json("id error");

      try {
        const issue = await Issue.findById(_id);

        if (!issue) return res.json(`could not delete ${_id}`);

        await issue.remove();
        res.json(`deleted ${_id}`);
      } catch (err) {
        next(err);
      }
    });
};
