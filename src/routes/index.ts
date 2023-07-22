var express = require('express');
var router = express.Router();

import DataManager from "../data/DataManager";
import { Promotion } from "../shared/Event";
import SearchResult from "../shared/SearchResult";

const dataManager: DataManager = new DataManager();
dataManager.refreshData();

const parsePromotions = (req): Promotion[] => {
  return req.query?.selectedPromotions?.split(',')?.map(x => parseInt(x) as Promotion) ?? [] as Promotion[];
}

/* GET home page. */
router.get('/events', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  const selectedPromotions = parsePromotions(req);
  const upcomingEventList = dataManager.upcomingEventList?.filter(x => selectedPromotions.indexOf(x.Promotion) > -1);

  res.end(JSON.stringify(upcomingEventList));
});

router.get('/archive', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  const selectedPromotions = parsePromotions(req);
  const archiveEventList = dataManager.archiveEventList?.filter(x => selectedPromotions.indexOf(x.Promotion) > -1);

  res.end(JSON.stringify(archiveEventList));
});

router.get('/search', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  const searchQuery = req.query.name;

  if (searchQuery && searchQuery.length > 0) {
    const searchResults = dataManager.searchResults?.filter(x => x.FighterName.indexOf(searchQuery) > -1) ?? [] as SearchResult[];
    res.end(JSON.stringify(searchResults));
  } else {
    res.end(JSON.stringify([]));
  }
});

router.get('/2a49239d258c4a0f97dd02d412d4e58c', function (req, res, next) {
  dataManager.refreshData();
  res.end(JSON.stringify({ result: "ok" }));
});

module.exports = router;
