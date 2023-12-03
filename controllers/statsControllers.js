// nodecors will create stats of each months

import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Stats } from "../models/statsModel.js";

export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  //  jo sbse last wala month hai uske stats hume sabse pehele chahiye to usko sort karte hai...aur hume pure 12 months chahiye to hum limit 12 laga denge...isse hume stats ki puri array mil jayengi
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);

  // stats ke data ki empty array banayenge
  const statsData = [];

  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }

  // abb hume required size 12 chahiye to jo remaining months hai hum wo nikal lenge
  const requiredSize = 12 - stats.length;

  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }

  const usersCount = statsData[11].users;
  const subscriptionsCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

  let usersPercentage = 0,
    viewsPercentage = 0,
    subscriptionsPercentage = 0;

  let usersProfit = true,
    viewsProfit = true,
    subscriptionsProfit = true;

  if (statsData[10].users === 0) usersPercentage = usersCount * 100;
  if (statsData[10].views === 0) viewsPercentage = viewsCount * 100;
  if (statsData[10].subscriptions === 0)
    subscriptionsPercentage = subscriptionsCount * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      views: statsData[11].views - statsData[10].views,
      subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
    };

    usersPercentage = (difference.users / statsData[10].users) * 100;
    viewsPercentage = (difference.views / statsData[10].views) * 100;
    subscriptionsPercentage =
      (difference.subscriptions / statsData[10].subscriptions) * 100;

    if (usersPercentage < 0) usersProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionsPercentage < 0) subscriptionsProfit = false;
  }

  res.status(200).json({
    success: true,
    stats: statsData,
    usersCount,
    subscriptionsCount,
    viewsCount,
    subscriptionsPercentage,
    viewsPercentage,
    usersPercentage,
    subscriptionsProfit,
    viewsProfit,
    usersProfit,
  });
});
