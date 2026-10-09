class AnalyticsController {
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }

  async getDashboard(req, res) {
    try {
      const report = await this.analyticsService.getDashboard(req.query);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AnalyticsController;
