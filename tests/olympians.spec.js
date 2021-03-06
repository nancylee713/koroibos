var shell = require('shelljs');
var request = require("supertest");
var app = require('../app');

const environment = process.env.NODE_ENV || 'test';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

describe('test get all olympians', () => {
  beforeEach(async () => {
    await database.raw('truncate table olympic cascade');

    let aanei = {
      "name": "Andreea Aanei",
      "sex": "F",
      "age": 22,
      "height": 170,
      "weight": 125,
      "team": "Romania",
      "games": "2016 Summer",
      "sport": "Weightlifting",
      "event": "Weightlifting Women's Super-Heavyweight",
      "medal": null
    };

    let sanjun = {
      "name": "Nstor Abad Sanjun",
      "sex": "M",
      "age": 23,
      "height": 167,
      "weight": 64,
      "team": "Spain",
      "games": "2016 Summer",
      "sport": "Gymnastics",
      "event": "Gymnastics Men's Individual All-Around",
      "medal": null
    };

    let dascl = {
      "name": "Ana Iulia Dascl",
      "sex": "F",
      "age": 13,
      "height": 183,
      "weight": 60,
      "team": "Romania",
      "games": "2016 Summer",
      "sport": "Swimming",
      "event": "Swimming Women's 100 metres Freestyle",
      "medal": null
    };

    let brougham = {
      "name": "Julie Brougham",
      "sex": "F",
      "age": 62,
      "height": 157,
      "weight": 48,
      "team": "New Zealand",
      "games": "2016 Summer",
      "sport": "Equestrianism",
      "event": "Equestrianism Mixed Dressage, Individual",
      "medal": null
    };

    await database('olympic').insert(aanei, 'id');
    await database('olympic').insert(sanjun, 'id');
    await database('olympic').insert(dascl, 'id');
    await database('olympic').insert(brougham, 'id');
  });

  afterEach(() => {
    database.raw('truncate table olympic cascade');
  });

  describe('test olympians GET', () => {
    it('happy path', async () => {
      const res = await request(app).get("/api/v1/olympians");

      expect(res.statusCode).toBe(200);

      expect(res.body['olympians'][0]).toHaveProperty('name');
      expect(res.body['olympians'][0].name).toEqual('Andreea Aanei');

      expect(res.body['olympians'][0]).toHaveProperty('team');
      expect(res.body['olympians'][0].team).toEqual('Romania');

      expect(res.body['olympians'][0]).toHaveProperty('age');
      expect(res.body['olympians'][0].age).toEqual(22);

      expect(res.body['olympians'][0]).toHaveProperty('sport');
      expect(res.body['olympians'][0].sport).toEqual('Weightlifting');

      expect(res.body['olympians'][0]).toHaveProperty('total_medals_won');
      expect(res.body['olympians'][0].total_medals_won).toEqual(0)

    });

    it('sad path', async () => {
      const res = await request(app).get("/api/v1/olympian");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toEqual('Not Found');
    });
  });

  describe('test GET youngest olympian', () => {
    it('happy path', async () => {
      const res = await request(app).get("/api/v1/olympians?age=youngest");

      expect(res.statusCode).toBe(200);

      expect(res.body['data'][0]).toHaveProperty('name');
      expect(res.body['data'][0].name).toEqual('Ana Iulia Dascl');

      expect(res.body['data'][0]).toHaveProperty('team');
      expect(res.body['data'][0].team).toEqual('Romania');

      expect(res.body['data'][0]).toHaveProperty('age');
      expect(res.body['data'][0].age).toEqual(13);

      expect(res.body['data'][0]).toHaveProperty('sport');
      expect(res.body['data'][0].sport).toEqual('Swimming');

      expect(res.body['data'][0]).toHaveProperty('total_medals_won');
      expect(res.body['data'][0].total_medals_won).toEqual(0)

    });

    it('sad path', async () => {
      const res = await request(app).get("/api/v1/olympian?age=middle");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toEqual('Not Found');
    });
  });

  describe('test GET oldest olympian', () => {
    it('happy path', async () => {
      const res = await request(app).get("/api/v1/olympians?age=oldest");

      expect(res.statusCode).toBe(200);

      expect(res.body['data'][0]).toHaveProperty('name');
      expect(res.body['data'][0].name).toEqual('Julie Brougham');

      expect(res.body['data'][0]).toHaveProperty('team');
      expect(res.body['data'][0].team).toEqual('New Zealand');

      expect(res.body['data'][0]).toHaveProperty('age');
      expect(res.body['data'][0].age).toEqual(62);

      expect(res.body['data'][0]).toHaveProperty('sport');
      expect(res.body['data'][0].sport).toEqual('Equestrianism');

      expect(res.body['data'][0]).toHaveProperty('total_medals_won');
      expect(res.body['data'][0].total_medals_won).toEqual(0)

    });

    it('sad path', async () => {
      const res = await request(app).get("/api/v1/olympian?age=random");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toEqual('Not Found');
    });
  });

  describe('test GET olympian stats', () => {
    it('happy path', async () => {
      const res = await request(app).get("/api/v1/olympian_stats");

      expect(res.statusCode).toBe(200);

      expect(res.body['olympian_stats']).toHaveProperty('total_competing_olympians');
      expect(res.body['olympian_stats'].total_competing_olympians).toEqual(4);

      expect(res.body['olympian_stats']).toHaveProperty('average_weight');
      expect(res.body['olympian_stats'].average_weight).toHaveProperty('unit');
      expect(res.body['olympian_stats'].average_weight.unit).toEqual('kg');

      expect(res.body['olympian_stats'].average_weight).toHaveProperty('male_olympians');
      expect(res.body['olympian_stats'].average_weight.male_olympians).toEqual(64);

      expect(res.body['olympian_stats'].average_weight).toHaveProperty('female_olympians');
      expect(res.body['olympian_stats'].average_weight.female_olympians).toEqual(77.7);

      expect(res.body['olympian_stats']).toHaveProperty('average_age');
      expect(res.body['olympian_stats'].average_age).toEqual(30);
    });

    it('sad path', async () => {
      const res = await request(app).get("/api/v1/olympianstats");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toEqual('Not Found');
    });
  });

  describe('test GET country stats', () => {
    it('happy path', async () => {
      const res = await request(app).get("/api/v1/country_stats");

      expect(res.statusCode).toBe(200);

      expect(res.body).toHaveProperty('countries');
      expect(res.body['countries'][0]).toHaveProperty('team');
      expect(res.body['countries'][0]).toHaveProperty('sports');

      expect(res.body['countries'][0].team).toEqual('New Zealand')
      expect(res.body['countries'][0].sports).toEqual(['Equestrianism'])
    });

    it('sad path', async () => {
      const res = await request(app).get("/api/v1/countrystats");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toEqual('Not Found');
    });
  });
});
