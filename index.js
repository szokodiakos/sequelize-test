'use strict';

const Sequelize = require('sequelize');
const co = require('co');

const database = 'sequelize-test-schema';
const username = 'root';
const password = 'rekto';
const sequelize = new Sequelize(database, username, password, {
  dialect: 'mariadb',
  host: 'localhost',
  port: 3306,
});

const Doctor = sequelize.define('doctor', {
  name: Sequelize.STRING,
}, {
  timestamps: false,
});

const Practice = sequelize.define('practice', {
  name: Sequelize.STRING,
}, {
  timestamps: false,
});

const Contact = sequelize.define('contact', {
  value: Sequelize.STRING,
  contactable: Sequelize.STRING,
  contactable_id: Sequelize.INTEGER,
}, {
  timestamps: false,
});

Doctor.hasMany(Contact, {
  foreignKey: 'contactable_id',
  constraints: false,
  scope: {
    contactable: 'doctor',
  },
});

Contact.belongsTo(Doctor, {
  foreignKey: 'contactable_id',
  constraints: false,
  as: 'doctor',
});

Practice.hasMany(Contact, {
  foreignKey: 'contactable_id',
  constraints: false,
  scope: {
    contactable: 'practice',
  },
});

Contact.belongsTo(Practice, {
  foreignKey: 'contactable_id',
  constraints: false,
  as: 'practice',
});

co(function * coIndex() {
  yield sequelize.sync({ force: true });

  let doctor = Doctor.build({ name: 'Dr. Hey' });
  doctor = yield doctor.save();

  yield doctor.createContact({ value: 'A contact for doctor' });

  let practice = Practice.build({ name: 'The Woo Practice' });
  practice = yield practice.save();

  yield practice.createContact({ value: 'A contact for practice' });

  yield practice.createContact({ value: 'Another contact for practice' });

  console.log('done');
}).catch(console.log.bind(console));

/*
  contacts table (id, value, contactable, contactable_id)
  --------------
  '1', 'A contact for doctor', 'doctor', '1'
  '2', 'A contact for practice', 'practice', '1'
  '3', 'Another contact for practice', 'practice', '1'

  doctors table (id, name)
  -------------
  '1', 'Dr. Hey'

  practices table (id, name)
  ---------------
  '1', 'The Woo Practice'

 */
