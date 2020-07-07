/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

const chaiHttp = require("chai-http");

const chai = require("chai");
const Issue = require("../models/Issue");
const server = require("../server");

const { assert } = chai;

const globals = {
  updatedIssueTitle: "The Menance of Powerpuff Girls",
  updatedIssueText: "Powerpuff Girls BAD",
  updatedCreatedBy: "Mojo Jojo",
  updatedAssignedTo: "Cartoon Network",
  updatedStatusText: "No one cares",
};

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("POST /api/issues/{project} => object with issue data", () => {
    test("Every field filled in", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
          assigned_to: "Chai and Mocha",
          status_text: "In QA",
        })
        .end((err, res) => {
          globals._id = res.body._id;

          assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.propertyVal(res.body, "issue_title", "Title");
          assert.propertyVal(res.body, "issue_text", "text");
          assert.propertyVal(
            res.body,
            "created_by",
            "Functional Test - Every field filled in"
          );
          assert.propertyVal(res.body, "assigned_to", "Chai and Mocha");
          assert.propertyVal(res.body, "status_text", "In QA");
          assert.property(res.body, "created_on");
          assert.property(res.body, "updated_on");
          assert.propertyVal(res.body, "open", true);
          done();
        });
    });

    test("Required fields filled in", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "Title",
          issue_text: "text",
          created_by: "Functional Test - Every field filled in",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "_id");
          assert.propertyVal(res.body, "issue_title", "Title");
          assert.propertyVal(res.body, "issue_text", "text");
          assert.propertyVal(
            res.body,
            "created_by",
            "Functional Test - Every field filled in"
          );
          assert.propertyVal(res.body, "assigned_to", "");
          assert.propertyVal(res.body, "status_text", "");
          done();
        });
    });

    test("Missing required fields", (done) => {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.propertyVal(res.body, "error", "Missing required fields");
          done();
        });
    });
  });

  suite("PUT /api/issues/{project} => text", () => {
    test("No body", (done) => {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.propertyVal(res.body, "error", "No body");
          done();
        });
    });

    test("One field to update", (done) => {
      const { _id } = globals;
      let originalIssueTitle;
      let originalUpdateDate;

      Issue.findById(_id).then((issue) => {
        originalIssueTitle = issue.issue_title;
        originalUpdateDate = new Date(issue.updated_on);
      });

      assert.notEqual(originalIssueTitle, "updated title");

      chai
        .request(server)
        .put("/api/issues/test")
        .send({ _id, issue_title: "updated title" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, `successfully updated ${_id}`);
          Issue.findById({ _id }).then((updatedIssue) => {
            assert.propertyVal(updatedIssue, "issue_title", "updated title");
            assert.notEqual(originalUpdateDate, updatedIssue.updated_on);
          });
          done();
        });
    });

    test("Multiple fields to update", (done) => {
      const { _id } = globals;

      let originalIssueTitle;
      let originalIssueText;
      let originalCreatedBy;
      let originalAssignedTo;
      let originalStatusText;

      Issue.findById(_id).then((issue) => {
        originalIssueTitle = issue.issue_title;
        originalIssueText = issue.issue_text;
        originalCreatedBy = issue.created_by;
        originalAssignedTo = issue.assigned_to;
        originalStatusText = issue.status_text;
        assert.notEqual(issue.open, false);
      });

      assert.notEqual(originalIssueTitle, globals.updatedIssueTitle);
      assert.notEqual(originalIssueText, globals.updatedIssueText);
      assert.notEqual(originalCreatedBy, globals.updatedCreatedBy);
      assert.notEqual(originalAssignedTo, globals.updatedAssignedTo);
      assert.notEqual(originalStatusText, globals.updatedStatusText);

      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id,
          issue_title: globals.updatedIssueTitle,
          issue_text: globals.updatedIssueText,
          created_by: globals.updatedCreatedBy,
          assigned_to: globals.updatedAssignedTo,
          status_text: globals.updatedStatusText,
          open: "false",
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, `successfully updated ${_id}`);
          Issue.findById({ _id }).then((updatedIssue) => {
            assert.propertyVal(
              updatedIssue,
              "issue_title",
              globals.updatedIssueTitle
            );
            assert.propertyVal(
              updatedIssue,
              "issue_text",
              globals.updatedIssueText
            );
            assert.propertyVal(updatedIssue, "open", false);
          });
          done();
        });
    });
  });

  suite("GET /api/issues/{project} => Array of objects with issue data", () => {
    test("No filter", (done) => {
      chai
        .request(server)
        .get("/api/issues/test")
        .query({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "_id");
          done();
        });
    });

    test("One filter", (done) => {
      chai
        .request(server)
        .get("/api/issues/test")
        .query({
          assigned_to: globals.updatedAssignedTo,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "_id");
          assert.equal(res.body[0].assigned_to, globals.updatedAssignedTo);
          done();
        });
    });

    test("Multiple filters (test for multiple fields you know will be in the db for a return)", (done) => {
      chai
        .request(server)
        .get("/api/issues/test")
        .query({
          assigned_to: globals.updatedAssignedTo,
          created_by: globals.updatedCreatedBy,
          status_text: globals.updatedStatusText,
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], "issue_title");
          assert.property(res.body[0], "issue_text");
          assert.property(res.body[0], "created_on");
          assert.property(res.body[0], "updated_on");
          assert.property(res.body[0], "created_by");
          assert.property(res.body[0], "assigned_to");
          assert.property(res.body[0], "open");
          assert.property(res.body[0], "status_text");
          assert.property(res.body[0], "_id");
          assert.equal(res.body[0].assigned_to, globals.updatedAssignedTo);
          assert.equal(res.body[0].created_by, globals.updatedCreatedBy);
          assert.equal(res.body[0].status_text, globals.updatedStatusText);
          done();
        });
    });
  });

  suite("DELETE /api/issues/{project} => text", () => {
    test("No _id", (done) => {
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 400);
          assert.equal(res.body, "id error");
          done();
        });
    });

    test("Valid _id", (done) => {
      const { _id } = globals;
      chai
        .request(server)
        .delete("/api/issues/apitest")
        .send({ _id })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body, `deleted ${_id}`);
          done();
        });
    });
  });
});
