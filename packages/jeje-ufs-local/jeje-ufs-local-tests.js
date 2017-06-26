// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by jeje-ufs-local.js.
import { name as packageName } from "meteor/jeje-ufs-local";

// Write your tests here!
// Here is an example.
Tinytest.add('jeje-ufs-local - example', function (test) {
  test.equal(packageName, "jeje-ufs-local");
});
