var express = require('express');
var router = express.Router();

import DataManager from "../data/DataManager";
import { Promotion } from "../shared/Event";
import Event from "../shared/Event";
import SearchResult from "../shared/SearchResult";

const dataManager: DataManager = new DataManager();
dataManager.refreshData();

const minsToRefresh = isNaN(Number(process.env.MINS_REFRESH)) ? 60 : Number(process.env.MINS_REFRESH);
setInterval(async () => { await dataManager.refreshData(); }, minsToRefresh * 60000);

const parsePromotions = (req): Promotion[] => {
  return req.query?.selectedPromotions?.split(',')?.map(x => parseInt(x) as Promotion).filter(x => isNaN(x) === false) ?? [] as Promotion[];
}

/* GET home page. */
router.get('/events', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  const selectedPromotions = parsePromotions(req);
  let upcomingEventList = dataManager.upcomingEventList;

  if (selectedPromotions && selectedPromotions.length > 0) {
    upcomingEventList = upcomingEventList?.filter(x => selectedPromotions.indexOf(x.Promotion) > -1);
  }

  res.end(JSON.stringify(upcomingEventList));
});

router.get('/archive', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  const selectedPromotions = parsePromotions(req);
  let archiveEventList = dataManager.archiveEventList;

  if (selectedPromotions && selectedPromotions.length) {
    archiveEventList = archiveEventList?.filter(x => selectedPromotions.indexOf(x.Promotion) > -1);
  }

  res.end(JSON.stringify(archiveEventList));
});

router.get('/search', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  const searchQuery = req.query.name.toLowerCase();

  if (searchQuery && searchQuery.length > 0) {
    const searchResults = dataManager.searchResults?.filter(x => x.FighterName.toLowerCase().indexOf(searchQuery) > -1) ?? [] as SearchResult[];
    res.end(JSON.stringify(searchResults));
  } else {
    res.end(JSON.stringify([]));
  }
});

router.get('/2a49239d258c4a0f97dd02d412d4e58c', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  dataManager.refreshData();
  res.end(JSON.stringify({ result: "ok" }));
});

router.get('/event/:eventId', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  const eventId = req.params.eventId as string;

  let event = dataManager.upcomingEvents.filter(x => x.Id === eventId);
  if (event.length === 0) {
    event = dataManager.archiveEvents.filter(x => x.Id === eventId);
  }

  if (event.length === 1) {
    res.end(JSON.stringify(event[0]));
  } else {
    res.sendStatus(404);
  }
});

router.get('/root', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  let rootEvent: Event | null = null;
  const selectedPromotions = parsePromotions(req);

  // if selected promotions includes UFC that's our root
  if (!selectedPromotions || selectedPromotions.length === 0 || selectedPromotions.indexOf(Promotion.UFC) > -1) {
    rootEvent = dataManager.possibleRoots.filter(x => x.Promotion === Promotion.UFC)[0];
  } else {
    rootEvent = dataManager.possibleRoots.filter(x => selectedPromotions.indexOf(x.Promotion) > -1)[0];
  }
  res.end(JSON.stringify(rootEvent));
});

router.get('/all', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  const allEvents = [...dataManager.archiveEvents, ...dataManager.upcomingEvents];
  res.end(JSON.stringify(allEvents));
});


module.exports = router;
