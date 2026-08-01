import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { multiCompanyService } from '../../services/multiCompanyService';
import { logger } from '../../services/loggerService';

export function createMultiCompanyRouter(io?: SocketIOServer): Router {
  const router = Router();

  // GET /api/multicompany/companies
  router.get('/companies', (req, res) => {
    try {
      const companies = multiCompanyService.getCompanies();
      res.json({ success: true, data: companies });
    } catch (error: any) {
      logger.error('Error fetching companies:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/multicompany/companies
  router.post('/companies', (req, res) => {
    try {
      const company = multiCompanyService.createCompany(req.body);
      if (io) {
        io.emit('company_created', company);
      }
      res.status(201).json({ success: true, data: company });
    } catch (error: any) {
      logger.error('Error creating company:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // PUT /api/multicompany/companies/:id
  router.put('/companies/:id', (req, res) => {
    try {
      const updated = multiCompanyService.updateCompany(req.params.id, req.body);
      if (io) {
        io.emit('company_updated', updated);
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error updating company:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // GET /api/multicompany/venues
  router.get('/venues', (req, res) => {
    try {
      const { companyId } = req.query;
      const venues = multiCompanyService.getVenues(companyId as string);
      res.json({ success: true, data: venues });
    } catch (error: any) {
      logger.error('Error fetching venues:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/multicompany/venues
  router.post('/venues', (req, res) => {
    try {
      const venue = multiCompanyService.createVenue(req.body);
      if (io) {
        io.emit('venue_created', venue);
      }
      res.status(201).json({ success: true, data: venue });
    } catch (error: any) {
      logger.error('Error creating venue:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // PUT /api/multicompany/venues/:id
  router.put('/venues/:id', (req, res) => {
    try {
      const updated = multiCompanyService.updateVenue(req.params.id, req.body);
      if (io) {
        io.emit('venue_updated', updated);
      }
      res.json({ success: true, data: updated });
    } catch (error: any) {
      logger.error('Error updating venue:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // GET /api/multicompany/corporate-kpis
  router.get('/corporate-kpis', (req, res) => {
    try {
      const kpis = multiCompanyService.getCorporateKPIs();
      res.json({ success: true, data: kpis });
    } catch (error: any) {
      logger.error('Error fetching corporate KPIs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/multicompany/ai-diagnosis
  router.get('/ai-diagnosis', (req, res) => {
    try {
      const diagnosis = multiCompanyService.getCorporateAIDiagnosis();
      res.json({ success: true, data: diagnosis });
    } catch (error: any) {
      logger.error('Error fetching corporate AI diagnosis:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/multicompany/scope
  router.get('/scope', (req, res) => {
    try {
      const scope = multiCompanyService.getActiveScope();
      res.json({ success: true, data: scope });
    } catch (error: any) {
      logger.error('Error fetching active scope:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/multicompany/switch-scope
  router.post('/switch-scope', (req, res) => {
    try {
      const { companyId, venueId } = req.body;
      const newScope = multiCompanyService.setActiveScope(companyId, venueId);
      if (io) {
        io.emit('scope_switched', newScope);
      }
      res.json({ success: true, data: newScope });
    } catch (error: any) {
      logger.error('Error switching scope:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  return router;
}
