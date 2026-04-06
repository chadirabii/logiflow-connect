// ============= TYPES =============
export type UserRole = 'admin' | 'client' | 'manager';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
  company?: string;
  phone?: string;
  rneFile?: string;
  patenteFile?: string;
  avatar?: string;
  createdAt: string;
}

export type ReclamationStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type ReclamationPriority = 'low' | 'medium' | 'high';

export interface Reclamation {
  id: string;
  clientId: string;
  clientName: string;
  bookingRef?: string;
  subject: string;
  description: string;
  priority: ReclamationPriority;
  status: ReclamationStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export const RECLAMATION_STATUS_LABELS: Record<ReclamationStatus, string> = {
  open: 'Ouverte',
  in_progress: 'En traitement',
  resolved: 'Résolue',
  closed: 'Fermée',
};

export const RECLAMATION_STATUS_COLORS: Record<ReclamationStatus, string> = {
  open: 'bg-warning/10 text-warning',
  in_progress: 'bg-accent/10 text-accent',
  resolved: 'bg-success/10 text-success',
  closed: 'bg-muted text-muted-foreground',
};

export const RECLAMATION_PRIORITY_LABELS: Record<ReclamationPriority, string> = {
  low: 'Faible',
  medium: 'Moyenne',
  high: 'Élevée',
};

export const RECLAMATION_PRIORITY_COLORS: Record<ReclamationPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

export interface BookingRequest {
  id: string;
  clientId: string;
  referenceNumber: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  originCountry: string;
  originPort: string;
  destinationCountry: string;
  destinationPort: string;
  cargoType: string;
  weight: number;
  volume: number;
  containerType: string;
  shipmentMode: 'FCL' | 'LCL';
  incoterm: string;
  requestedDate: string;
  specialInstructions?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'confirmed'
  | 'in_transit'
  | 'arrived_port'
  | 'customs'
  | 'delivering'
  | 'delivered';

export interface Shipment {
  id: string;
  bookingId: string;
  clientId: string;
  referenceNumber: string;
  status: BookingStatus;
  currentLocation: string;
  currentPort: string;
  estimatedArrival: string;
  originPort: string;
  destinationPort: string;
  vessel?: string;
  containerNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: BookingStatus;
  location: string;
  port?: string;
  description: string;
  timestamp: string;
}

export interface Document {
  id: string;
  bookingId?: string;
  shipmentId?: string;
  clientId: string;
  name: string;
  type: 'invoice' | 'packing_list' | 'customs' | 'transport' | 'contract' | 'other';
  size: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  read: boolean;
  attachment?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Port {
  id: string;
  name: string;
  country: string;
  code: string;
}

export const PORTS: Port[] = [
  { id: 'p1', name: 'Port de Radès', country: 'Tunisie', code: 'TNRAD' },
  { id: 'p2', name: 'Port de La Goulette', country: 'Tunisie', code: 'TNGOU' },
  { id: 'p3', name: 'Port de Sfax', country: 'Tunisie', code: 'TNSFA' },
  { id: 'p4', name: 'Port de Sousse', country: 'Tunisie', code: 'TNSUS' },
  { id: 'p5', name: 'Port de Bizerte', country: 'Tunisie', code: 'TNBIZ' },
  { id: 'p6', name: 'Port de Gabès', country: 'Tunisie', code: 'TNGAB' },
  { id: 'p7', name: 'Port de Zarzis', country: 'Tunisie', code: 'TNZAR' },
  { id: 'p8', name: 'Port de Marseille', country: 'France', code: 'FRMRS' },
  { id: 'p9', name: 'Port du Havre', country: 'France', code: 'FRLEH' },
  { id: 'p10', name: 'Port de Gênes', country: 'Italie', code: 'ITGOA' },
  { id: 'p11', name: 'Port de Rotterdam', country: 'Pays-Bas', code: 'NLRTM' },
  { id: 'p12', name: 'Port de Hambourg', country: 'Allemagne', code: 'DEHAM' },
  { id: 'p13', name: 'Port de Shanghai', country: 'Chine', code: 'CNSHA' },
  { id: 'p14', name: 'Port de Barcelone', country: 'Espagne', code: 'ESBCN' },
  { id: 'p15', name: 'Port de Jebel Ali', country: 'EAU', code: 'AEJEA' },
  { id: 'p16', name: 'Port d\'Istanbul', country: 'Turquie', code: 'TRIST' },
];

export const CONTAINER_TYPES = [
  "20' Standard (20GP)",
  "40' Standard (40GP)",
  "40' High Cube (40HC)",
  "20' Reefer (20RF)",
  "40' Reefer (40RF)",
  "20' Open Top (20OT)",
  "40' Open Top (40OT)",
  "20' Flat Rack (20FR)",
  "40' Flat Rack (40FR)",
];

export const INCOTERMS = [
  'EXW - Ex Works',
  'FCA - Free Carrier',
  'FAS - Free Alongside Ship',
  'FOB - Free on Board',
  'CFR - Cost and Freight',
  'CIF - Cost, Insurance and Freight',
  'CPT - Carriage Paid To',
  'CIP - Carriage and Insurance Paid To',
  'DAP - Delivered at Place',
  'DPU - Delivered at Place Unloaded',
  'DDP - Delivered Duty Paid',
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  submitted: 'Demande soumise',
  under_review: 'En cours de validation',
  approved: 'Approuvée',
  rejected: 'Refusée',
  confirmed: 'Réservation confirmée',
  in_transit: 'En transit',
  arrived_port: 'Arrivée au port',
  customs: 'En douane',
  delivering: 'En cours de livraison',
  delivered: 'Livrée',
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  submitted: 'bg-muted text-muted-foreground',
  under_review: 'bg-warning/10 text-warning',
  approved: 'bg-info/10 text-info',
  rejected: 'bg-destructive/10 text-destructive',
  confirmed: 'bg-accent/10 text-accent',
  in_transit: 'bg-accent/10 text-accent',
  arrived_port: 'bg-info/10 text-info',
  customs: 'bg-warning/10 text-warning',
  delivering: 'bg-accent/10 text-accent',
  delivered: 'bg-success/10 text-success',
};

// ============= MOCK DATA =============

export const users: User[] = [
  { id: 'u1', email: 'admin@247logistics.com', password: 'admin123', role: 'admin', fullName: 'Mohamed Bennani', company: '24/7 Logistics', phone: '+212 600 000 001', createdAt: '2024-01-01' },
  { id: 'u9', email: 'manager@247logistics.com', password: 'manager123', role: 'manager', fullName: 'Youssef Amrani', company: '24/7 Logistics', phone: '+212 600 000 010', createdAt: '2024-01-15' },
  { id: 'u2', email: 'karim@textilemarket.ma', password: 'client123', role: 'client', fullName: 'Karim El Fassi', company: 'Textile Market SARL', phone: '+212 600 100 001', rneFile: 'rne_karim.pdf', patenteFile: 'patente_karim.pdf', createdAt: '2024-02-15' },
  { id: 'u3', email: 'sophie@agroexport.fr', password: 'client123', role: 'client', fullName: 'Sophie Martin', company: 'AgroExport France', phone: '+33 6 12 34 56 78', rneFile: 'rne_sophie.pdf', patenteFile: 'patente_sophie.pdf', createdAt: '2024-03-01' },
  { id: 'u4', email: 'ahmed@casaimport.ma', password: 'client123', role: 'client', fullName: 'Ahmed Tazi', company: 'Casa Import SA', phone: '+212 600 200 002', rneFile: 'rne_ahmed.pdf', patenteFile: 'patente_ahmed.pdf', createdAt: '2024-03-20' },
  { id: 'u5', email: 'li.wei@shenzhentrade.cn', password: 'client123', role: 'client', fullName: 'Li Wei', company: 'Shenzhen Trade Co.', phone: '+86 138 0000 0001', rneFile: 'rne_li.pdf', patenteFile: 'patente_li.pdf', createdAt: '2024-04-10' },
  { id: 'u6', email: 'fatima@pharmalog.ma', password: 'client123', role: 'client', fullName: 'Fatima Zahra Alaoui', company: 'PharmaLog Maroc', phone: '+212 600 300 003', rneFile: 'rne_fatima.pdf', patenteFile: 'patente_fatima.pdf', createdAt: '2024-05-01' },
  { id: 'u7', email: 'jan@dutchfoods.nl', password: 'client123', role: 'client', fullName: 'Jan Van Der Berg', company: 'Dutch Foods BV', phone: '+31 6 12345678', rneFile: 'rne_jan.pdf', patenteFile: 'patente_jan.pdf', createdAt: '2024-05-20' },
  { id: 'u8', email: 'marco@italiaparts.it', password: 'client123', role: 'client', fullName: 'Marco Rossi', company: 'Italia Parts SRL', phone: '+39 333 1234567', rneFile: 'rne_marco.pdf', patenteFile: 'patente_marco.pdf', createdAt: '2024-06-15' },
];

export const reclamations: Reclamation[] = [
  { id: 'r1', clientId: 'u2', clientName: 'Karim El Fassi', bookingRef: 'BK-2024-0001', subject: 'Retard de livraison', description: 'Ma livraison prévue pour le 5 septembre n\'est toujours pas arrivée. Je demande des explications sur ce retard.', priority: 'high', status: 'in_progress', adminResponse: 'Nous avons vérifié et le navire a subi un retard de 3 jours au Canal de Suez. Nouvelle ETA : 8 septembre.', createdAt: '2024-09-06', updatedAt: '2024-09-07' },
  { id: 'r2', clientId: 'u3', clientName: 'Sophie Martin', bookingRef: 'BK-2024-0002', subject: 'Marchandise endommagée', description: 'Plusieurs caisses de produits agricoles sont arrivées endommagées. Photos jointes à la conversation.', priority: 'high', status: 'resolved', adminResponse: 'Nous avons ouvert un dossier d\'assurance. Remboursement prévu sous 15 jours ouvrables.', createdAt: '2024-09-22', updatedAt: '2024-10-01' },
  { id: 'r3', clientId: 'u4', clientName: 'Ahmed Tazi', bookingRef: 'BK-2024-0003', subject: 'Erreur sur la facture', description: 'Le montant facturé ne correspond pas au devis initial. Il y a une différence de 500€.', priority: 'medium', status: 'open', createdAt: '2024-10-02', updatedAt: '2024-10-02' },
  { id: 'r4', clientId: 'u6', clientName: 'Fatima Zahra Alaoui', subject: 'Problème de température', description: 'Le conteneur reefer n\'a pas maintenu la température requise de 2-8°C pendant le transit.', priority: 'high', status: 'open', createdAt: '2024-10-05', updatedAt: '2024-10-05' },
  { id: 'r5', clientId: 'u7', clientName: 'Jan Van Der Berg', bookingRef: 'BK-2024-0006', subject: 'Documents manquants', description: 'Je n\'ai toujours pas reçu le connaissement maritime pour ma commande.', priority: 'low', status: 'closed', adminResponse: 'Le document a été envoyé par email et ajouté à votre espace documents.', createdAt: '2024-10-08', updatedAt: '2024-10-10' },
];

export const bookingRequests: BookingRequest[] = [
  { id: 'b1', clientId: 'u2', referenceNumber: 'BK-2024-0001', fullName: 'Karim El Fassi', company: 'Textile Market SARL', email: 'karim@textilemarket.ma', phone: '+212 600 100 001', originCountry: 'Chine', originPort: 'Port de Shanghai', destinationCountry: 'Maroc', destinationPort: 'Port de Casablanca', cargoType: 'Textiles et vêtements', weight: 12000, volume: 65, containerType: "40' High Cube (40HC)", shipmentMode: 'FCL', incoterm: 'CIF - Cost, Insurance and Freight', requestedDate: '2024-08-15', specialInstructions: 'Marchandise fragile, éviter l\'humidité', status: 'in_transit', createdAt: '2024-07-20', updatedAt: '2024-08-10' },
  { id: 'b2', clientId: 'u3', referenceNumber: 'BK-2024-0002', fullName: 'Sophie Martin', company: 'AgroExport France', email: 'sophie@agroexport.fr', phone: '+33 6 12 34 56 78', originCountry: 'Maroc', originPort: 'Port de Casablanca', destinationCountry: 'France', destinationPort: 'Port de Marseille', cargoType: 'Produits agricoles', weight: 8500, volume: 40, containerType: "20' Reefer (20RF)", shipmentMode: 'FCL', incoterm: 'FOB - Free on Board', requestedDate: '2024-09-01', specialInstructions: 'Température contrôlée à 4°C', status: 'delivered', createdAt: '2024-08-05', updatedAt: '2024-09-20' },
  { id: 'b3', clientId: 'u4', referenceNumber: 'BK-2024-0003', fullName: 'Ahmed Tazi', company: 'Casa Import SA', email: 'ahmed@casaimport.ma', phone: '+212 600 200 002', originCountry: 'Allemagne', originPort: 'Port de Hambourg', destinationCountry: 'Maroc', destinationPort: 'Tanger Med', cargoType: 'Pièces automobiles', weight: 15000, volume: 55, containerType: "40' Standard (40GP)", shipmentMode: 'FCL', incoterm: 'DAP - Delivered at Place', requestedDate: '2024-10-01', status: 'confirmed', createdAt: '2024-09-10', updatedAt: '2024-09-25' },
  { id: 'b4', clientId: 'u5', referenceNumber: 'BK-2024-0004', fullName: 'Li Wei', company: 'Shenzhen Trade Co.', email: 'li.wei@shenzhentrade.cn', phone: '+86 138 0000 0001', originCountry: 'Chine', originPort: 'Port de Shanghai', destinationCountry: 'Pays-Bas', destinationPort: 'Port de Rotterdam', cargoType: 'Électronique', weight: 5000, volume: 25, containerType: "20' Standard (20GP)", shipmentMode: 'LCL', incoterm: 'CIF - Cost, Insurance and Freight', requestedDate: '2024-09-15', status: 'in_transit', createdAt: '2024-08-28', updatedAt: '2024-09-15' },
  { id: 'b5', clientId: 'u6', referenceNumber: 'BK-2024-0005', fullName: 'Fatima Zahra Alaoui', company: 'PharmaLog Maroc', email: 'fatima@pharmalog.ma', phone: '+212 600 300 003', originCountry: 'France', originPort: 'Port du Havre', destinationCountry: 'Maroc', destinationPort: 'Port de Casablanca', cargoType: 'Produits pharmaceutiques', weight: 3000, volume: 15, containerType: "20' Reefer (20RF)", shipmentMode: 'LCL', incoterm: 'DDP - Delivered Duty Paid', requestedDate: '2024-10-10', specialInstructions: 'Chaîne du froid stricte, 2-8°C', status: 'submitted', createdAt: '2024-10-01', updatedAt: '2024-10-01' },
  { id: 'b6', clientId: 'u7', referenceNumber: 'BK-2024-0006', fullName: 'Jan Van Der Berg', company: 'Dutch Foods BV', email: 'jan@dutchfoods.nl', phone: '+31 6 12345678', originCountry: 'Pays-Bas', originPort: 'Port de Rotterdam', destinationCountry: 'Maroc', destinationPort: 'Tanger Med', cargoType: 'Produits laitiers', weight: 10000, volume: 45, containerType: "40' Reefer (40RF)", shipmentMode: 'FCL', incoterm: 'CIF - Cost, Insurance and Freight', requestedDate: '2024-10-20', status: 'under_review', createdAt: '2024-10-05', updatedAt: '2024-10-05' },
  { id: 'b7', clientId: 'u8', referenceNumber: 'BK-2024-0007', fullName: 'Marco Rossi', company: 'Italia Parts SRL', email: 'marco@italiaparts.it', phone: '+39 333 1234567', originCountry: 'Italie', originPort: 'Port de Gênes', destinationCountry: 'Maroc', destinationPort: 'Port de Casablanca', cargoType: 'Machines industrielles', weight: 20000, volume: 80, containerType: "40' Flat Rack (40FR)", shipmentMode: 'FCL', incoterm: 'FOB - Free on Board', requestedDate: '2024-11-01', status: 'approved', createdAt: '2024-10-10', updatedAt: '2024-10-15' },
  { id: 'b8', clientId: 'u2', referenceNumber: 'BK-2024-0008', fullName: 'Karim El Fassi', company: 'Textile Market SARL', email: 'karim@textilemarket.ma', phone: '+212 600 100 001', originCountry: 'Turquie', originPort: 'Port d\'Istanbul', destinationCountry: 'Maroc', destinationPort: 'Tanger Med', cargoType: 'Tissus et accessoires', weight: 7000, volume: 35, containerType: "20' Standard (20GP)", shipmentMode: 'FCL', incoterm: 'EXW - Ex Works', requestedDate: '2024-11-15', status: 'submitted', createdAt: '2024-10-20', updatedAt: '2024-10-20' },
  { id: 'b9', clientId: 'u3', referenceNumber: 'BK-2024-0009', fullName: 'Sophie Martin', company: 'AgroExport France', email: 'sophie@agroexport.fr', phone: '+33 6 12 34 56 78', originCountry: 'Maroc', originPort: 'Port de Casablanca', destinationCountry: 'Belgique', destinationPort: 'Port d\'Anvers', cargoType: 'Agrumes', weight: 12000, volume: 50, containerType: "40' Reefer (40RF)", shipmentMode: 'FCL', incoterm: 'FOB - Free on Board', requestedDate: '2024-11-20', status: 'customs', createdAt: '2024-10-25', updatedAt: '2024-11-18' },
  { id: 'b10', clientId: 'u4', referenceNumber: 'BK-2024-0010', fullName: 'Ahmed Tazi', company: 'Casa Import SA', email: 'ahmed@casaimport.ma', phone: '+212 600 200 002', originCountry: 'Espagne', originPort: 'Port de Barcelone', destinationCountry: 'Maroc', destinationPort: 'Tanger Med', cargoType: 'Matériaux de construction', weight: 25000, volume: 90, containerType: "40' Open Top (40OT)", shipmentMode: 'FCL', incoterm: 'CFR - Cost and Freight', requestedDate: '2024-12-01', status: 'arrived_port', createdAt: '2024-11-05', updatedAt: '2024-11-28' },
  { id: 'b11', clientId: 'u5', referenceNumber: 'BK-2024-0011', fullName: 'Li Wei', company: 'Shenzhen Trade Co.', email: 'li.wei@shenzhentrade.cn', phone: '+86 138 0000 0001', originCountry: 'Chine', originPort: 'Port de Shanghai', destinationCountry: 'EAU', destinationPort: 'Port de Jebel Ali', cargoType: 'Composants électroniques', weight: 2000, volume: 10, containerType: "20' Standard (20GP)", shipmentMode: 'LCL', incoterm: 'CIF - Cost, Insurance and Freight', requestedDate: '2024-12-10', status: 'delivering', createdAt: '2024-11-15', updatedAt: '2024-12-08' },
  { id: 'b12', clientId: 'u6', referenceNumber: 'BK-2024-0012', fullName: 'Fatima Zahra Alaoui', company: 'PharmaLog Maroc', email: 'fatima@pharmalog.ma', phone: '+212 600 300 003', originCountry: 'Singapour', originPort: 'Port de Singapour', destinationCountry: 'Maroc', destinationPort: 'Port de Casablanca', cargoType: 'Équipement médical', weight: 4000, volume: 20, containerType: "20' Standard (20GP)", shipmentMode: 'FCL', incoterm: 'DDP - Delivered Duty Paid', requestedDate: '2024-12-15', status: 'in_transit', createdAt: '2024-11-20', updatedAt: '2024-12-01' },
];

export const shipments: Shipment[] = [
  { id: 's1', bookingId: 'b1', clientId: 'u2', referenceNumber: 'SH-2024-0001', status: 'in_transit', currentLocation: 'Mer Méditerranée', currentPort: 'En mer', estimatedArrival: '2024-09-05', originPort: 'Port de Shanghai', destinationPort: 'Port de Casablanca', vessel: 'CMA CGM Marco Polo', containerNumber: 'CMAU2345678', createdAt: '2024-08-10', updatedAt: '2024-08-28' },
  { id: 's2', bookingId: 'b2', clientId: 'u3', referenceNumber: 'SH-2024-0002', status: 'delivered', currentLocation: 'Marseille, France', currentPort: 'Port de Marseille', estimatedArrival: '2024-09-18', originPort: 'Port de Casablanca', destinationPort: 'Port de Marseille', vessel: 'MSC Fantasia', containerNumber: 'MSCU9876543', createdAt: '2024-08-20', updatedAt: '2024-09-20' },
  { id: 's3', bookingId: 'b3', clientId: 'u4', referenceNumber: 'SH-2024-0003', status: 'confirmed', currentLocation: 'Hambourg, Allemagne', currentPort: 'Port de Hambourg', estimatedArrival: '2024-10-15', originPort: 'Port de Hambourg', destinationPort: 'Tanger Med', vessel: 'Maersk Sealand', containerNumber: 'MSKU1122334', createdAt: '2024-09-25', updatedAt: '2024-09-25' },
  { id: 's4', bookingId: 'b4', clientId: 'u5', referenceNumber: 'SH-2024-0004', status: 'in_transit', currentLocation: 'Canal de Suez', currentPort: 'En mer', estimatedArrival: '2024-10-10', originPort: 'Port de Shanghai', destinationPort: 'Port de Rotterdam', vessel: 'Ever Given', containerNumber: 'EISU5566778', createdAt: '2024-09-15', updatedAt: '2024-09-28' },
  { id: 's5', bookingId: 'b9', clientId: 'u3', referenceNumber: 'SH-2024-0005', status: 'customs', currentLocation: 'Anvers, Belgique', currentPort: 'Port d\'Anvers', estimatedArrival: '2024-11-22', originPort: 'Port de Casablanca', destinationPort: 'Port d\'Anvers', vessel: 'Hapag Lloyd Express', containerNumber: 'HLCU3344556', createdAt: '2024-11-01', updatedAt: '2024-11-18' },
  { id: 's6', bookingId: 'b10', clientId: 'u4', referenceNumber: 'SH-2024-0006', status: 'arrived_port', currentLocation: 'Tanger, Maroc', currentPort: 'Tanger Med', estimatedArrival: '2024-11-30', originPort: 'Port de Barcelone', destinationPort: 'Tanger Med', vessel: 'MSC Oscar', containerNumber: 'MSCU7788990', createdAt: '2024-11-10', updatedAt: '2024-11-28' },
  { id: 's7', bookingId: 'b11', clientId: 'u5', referenceNumber: 'SH-2024-0007', status: 'delivering', currentLocation: 'Dubaï, EAU', currentPort: 'Port de Jebel Ali', estimatedArrival: '2024-12-12', originPort: 'Port de Shanghai', destinationPort: 'Port de Jebel Ali', vessel: 'COSCO Shipping Leo', containerNumber: 'COSU1234567', createdAt: '2024-11-20', updatedAt: '2024-12-08' },
  { id: 's8', bookingId: 'b12', clientId: 'u6', referenceNumber: 'SH-2024-0008', status: 'in_transit', currentLocation: 'Océan Indien', currentPort: 'En mer', estimatedArrival: '2024-12-20', originPort: 'Port de Singapour', destinationPort: 'Port de Casablanca', vessel: 'CMA CGM Bougainville', containerNumber: 'CMAU9988776', createdAt: '2024-12-01', updatedAt: '2024-12-05' },
];

export const trackingEvents: TrackingEvent[] = [
  // Shipment 1
  { id: 'te1', shipmentId: 's1', status: 'submitted', location: 'Shanghai, Chine', port: 'Port de Shanghai', description: 'Demande de réservation soumise', timestamp: '2024-07-20T10:00:00' },
  { id: 'te2', shipmentId: 's1', status: 'approved', location: 'Shanghai, Chine', port: 'Port de Shanghai', description: 'Réservation approuvée', timestamp: '2024-07-25T14:00:00' },
  { id: 'te3', shipmentId: 's1', status: 'confirmed', location: 'Shanghai, Chine', port: 'Port de Shanghai', description: 'Conteneur chargé sur CMA CGM Marco Polo', timestamp: '2024-08-10T08:00:00' },
  { id: 'te4', shipmentId: 's1', status: 'in_transit', location: 'Détroit de Malacca', description: 'Navire en transit - Détroit de Malacca', timestamp: '2024-08-18T16:00:00' },
  { id: 'te5', shipmentId: 's1', status: 'in_transit', location: 'Mer Rouge', description: 'Passage Canal de Suez prévu', timestamp: '2024-08-25T09:00:00' },
  { id: 'te6', shipmentId: 's1', status: 'in_transit', location: 'Mer Méditerranée', description: 'En transit - Mer Méditerranée', timestamp: '2024-08-28T12:00:00' },
  // Shipment 2 (delivered)
  { id: 'te7', shipmentId: 's2', status: 'submitted', location: 'Casablanca, Maroc', port: 'Port de Casablanca', description: 'Demande soumise', timestamp: '2024-08-05T09:00:00' },
  { id: 'te8', shipmentId: 's2', status: 'confirmed', location: 'Casablanca, Maroc', port: 'Port de Casablanca', description: 'Conteneur reefer chargé', timestamp: '2024-08-20T07:00:00' },
  { id: 'te9', shipmentId: 's2', status: 'in_transit', location: 'Détroit de Gibraltar', description: 'En transit', timestamp: '2024-08-22T15:00:00' },
  { id: 'te10', shipmentId: 's2', status: 'arrived_port', location: 'Marseille, France', port: 'Port de Marseille', description: 'Arrivée au port de Marseille', timestamp: '2024-09-15T06:00:00' },
  { id: 'te11', shipmentId: 's2', status: 'customs', location: 'Marseille, France', port: 'Port de Marseille', description: 'Dédouanement en cours', timestamp: '2024-09-16T10:00:00' },
  { id: 'te12', shipmentId: 's2', status: 'delivered', location: 'Marseille, France', description: 'Marchandise livrée', timestamp: '2024-09-20T14:00:00' },
  // Shipment 4
  { id: 'te13', shipmentId: 's4', status: 'submitted', location: 'Shanghai, Chine', port: 'Port de Shanghai', description: 'Demande soumise', timestamp: '2024-08-28T11:00:00' },
  { id: 'te14', shipmentId: 's4', status: 'confirmed', location: 'Shanghai, Chine', port: 'Port de Shanghai', description: 'Chargement LCL confirmé', timestamp: '2024-09-15T08:00:00' },
  { id: 'te15', shipmentId: 's4', status: 'in_transit', location: 'Mer de Chine', description: 'Départ de Shanghai', timestamp: '2024-09-16T18:00:00' },
  { id: 'te16', shipmentId: 's4', status: 'in_transit', location: 'Canal de Suez', description: 'Passage du Canal de Suez', timestamp: '2024-09-28T07:00:00' },
  // Shipment 5
  { id: 'te17', shipmentId: 's5', status: 'submitted', location: 'Casablanca, Maroc', port: 'Port de Casablanca', description: 'Demande soumise', timestamp: '2024-10-25T09:00:00' },
  { id: 'te18', shipmentId: 's5', status: 'in_transit', location: 'Atlantique', description: 'En transit vers Anvers', timestamp: '2024-11-05T12:00:00' },
  { id: 'te19', shipmentId: 's5', status: 'arrived_port', location: 'Anvers, Belgique', port: 'Port d\'Anvers', description: 'Arrivée au port d\'Anvers', timestamp: '2024-11-15T06:00:00' },
  { id: 'te20', shipmentId: 's5', status: 'customs', location: 'Anvers, Belgique', port: 'Port d\'Anvers', description: 'En cours de dédouanement', timestamp: '2024-11-18T10:00:00' },
  // Shipment 6
  { id: 'te21', shipmentId: 's6', status: 'confirmed', location: 'Barcelone, Espagne', port: 'Port de Barcelone', description: 'Chargement effectué', timestamp: '2024-11-10T08:00:00' },
  { id: 'te22', shipmentId: 's6', status: 'in_transit', location: 'Mer Méditerranée', description: 'En transit', timestamp: '2024-11-12T14:00:00' },
  { id: 'te23', shipmentId: 's6', status: 'arrived_port', location: 'Tanger, Maroc', port: 'Tanger Med', description: 'Arrivée à Tanger Med', timestamp: '2024-11-28T06:00:00' },
  // Shipment 7
  { id: 'te24', shipmentId: 's7', status: 'confirmed', location: 'Shanghai, Chine', port: 'Port de Shanghai', description: 'Conteneur chargé', timestamp: '2024-11-20T10:00:00' },
  { id: 'te25', shipmentId: 's7', status: 'in_transit', location: 'Océan Indien', description: 'En transit', timestamp: '2024-11-28T08:00:00' },
  { id: 'te26', shipmentId: 's7', status: 'arrived_port', location: 'Dubaï, EAU', port: 'Port de Jebel Ali', description: 'Arrivée à Jebel Ali', timestamp: '2024-12-05T06:00:00' },
  { id: 'te27', shipmentId: 's7', status: 'delivering', location: 'Dubaï, EAU', description: 'En cours de livraison finale', timestamp: '2024-12-08T09:00:00' },
  // Shipment 8
  { id: 'te28', shipmentId: 's8', status: 'confirmed', location: 'Singapour', port: 'Port de Singapour', description: 'Conteneur reefer chargé', timestamp: '2024-12-01T07:00:00' },
  { id: 'te29', shipmentId: 's8', status: 'in_transit', location: 'Océan Indien', description: 'En transit vers Casablanca', timestamp: '2024-12-05T12:00:00' },
];

export const documents: Document[] = [
  { id: 'd1', bookingId: 'b1', shipmentId: 's1', clientId: 'u2', name: 'Facture_TM_2024_001.pdf', type: 'invoice', size: '245 KB', uploadedBy: 'u2', createdAt: '2024-07-20' },
  { id: 'd2', bookingId: 'b1', shipmentId: 's1', clientId: 'u2', name: 'Packing_List_TM_001.pdf', type: 'packing_list', size: '180 KB', uploadedBy: 'u2', createdAt: '2024-07-20' },
  { id: 'd3', bookingId: 'b1', shipmentId: 's1', clientId: 'u2', name: 'Bill_of_Lading_SH001.pdf', type: 'transport', size: '320 KB', uploadedBy: 'u1', createdAt: '2024-08-10' },
  { id: 'd4', bookingId: 'b2', shipmentId: 's2', clientId: 'u3', name: 'Facture_AE_2024_002.pdf', type: 'invoice', size: '198 KB', uploadedBy: 'u3', createdAt: '2024-08-05' },
  { id: 'd5', bookingId: 'b2', shipmentId: 's2', clientId: 'u3', name: 'Certificat_Phytosanitaire.pdf', type: 'customs', size: '150 KB', uploadedBy: 'u3', createdAt: '2024-08-05' },
  { id: 'd6', bookingId: 'b2', shipmentId: 's2', clientId: 'u3', name: 'Connaissement_SH002.pdf', type: 'transport', size: '290 KB', uploadedBy: 'u1', createdAt: '2024-08-20' },
  { id: 'd7', bookingId: 'b3', clientId: 'u4', name: 'Facture_CI_2024_003.pdf', type: 'invoice', size: '210 KB', uploadedBy: 'u4', createdAt: '2024-09-10' },
  { id: 'd8', bookingId: 'b3', clientId: 'u4', name: 'Packing_List_CI_003.xlsx', type: 'packing_list', size: '95 KB', uploadedBy: 'u4', createdAt: '2024-09-10' },
  { id: 'd9', bookingId: 'b4', shipmentId: 's4', clientId: 'u5', name: 'Invoice_ST_2024_004.pdf', type: 'invoice', size: '175 KB', uploadedBy: 'u5', createdAt: '2024-08-28' },
  { id: 'd10', bookingId: 'b4', shipmentId: 's4', clientId: 'u5', name: 'Customs_Declaration_004.pdf', type: 'customs', size: '260 KB', uploadedBy: 'u1', createdAt: '2024-09-15' },
  { id: 'd11', bookingId: 'b5', clientId: 'u6', name: 'Facture_PL_2024_005.pdf', type: 'invoice', size: '220 KB', uploadedBy: 'u6', createdAt: '2024-10-01' },
  { id: 'd12', bookingId: 'b7', clientId: 'u8', name: 'Factura_IP_2024_007.pdf', type: 'invoice', size: '190 KB', uploadedBy: 'u8', createdAt: '2024-10-10' },
  { id: 'd13', bookingId: 'b7', clientId: 'u8', name: 'Contratto_Trasporto_007.pdf', type: 'contract', size: '340 KB', uploadedBy: 'u1', createdAt: '2024-10-15' },
  { id: 'd14', bookingId: 'b9', shipmentId: 's5', clientId: 'u3', name: 'Facture_AE_2024_009.pdf', type: 'invoice', size: '205 KB', uploadedBy: 'u3', createdAt: '2024-10-25' },
  { id: 'd15', bookingId: 'b9', shipmentId: 's5', clientId: 'u3', name: 'Certificat_Origine_009.pdf', type: 'customs', size: '130 KB', uploadedBy: 'u3', createdAt: '2024-10-25' },
  { id: 'd16', bookingId: 'b10', shipmentId: 's6', clientId: 'u4', name: 'Facture_CI_2024_010.pdf', type: 'invoice', size: '230 KB', uploadedBy: 'u4', createdAt: '2024-11-05' },
  { id: 'd17', bookingId: 'b12', shipmentId: 's8', clientId: 'u6', name: 'Facture_PL_2024_012.pdf', type: 'invoice', size: '215 KB', uploadedBy: 'u6', createdAt: '2024-11-20' },
  { id: 'd18', bookingId: 'b12', shipmentId: 's8', clientId: 'u6', name: 'Licence_Import_Pharma.pdf', type: 'customs', size: '180 KB', uploadedBy: 'u6', createdAt: '2024-11-20' },
];

export const conversations: Conversation[] = [
  { id: 'conv1', clientId: 'u2', clientName: 'Karim El Fassi', lastMessage: 'D\'accord, merci pour la mise à jour.', lastMessageAt: '2024-10-20T16:30:00', unreadCount: 0 },
  { id: 'conv2', clientId: 'u3', clientName: 'Sophie Martin', lastMessage: 'Pouvez-vous m\'envoyer le connaissement ?', lastMessageAt: '2024-11-18T10:15:00', unreadCount: 1 },
  { id: 'conv3', clientId: 'u4', clientName: 'Ahmed Tazi', lastMessage: 'La livraison est prévue pour quand ?', lastMessageAt: '2024-11-28T14:00:00', unreadCount: 2 },
  { id: 'conv4', clientId: 'u5', clientName: 'Li Wei', lastMessage: 'Shipment tracking shows Suez canal. ETA still valid?', lastMessageAt: '2024-09-28T08:30:00', unreadCount: 0 },
  { id: 'conv5', clientId: 'u6', clientName: 'Fatima Zahra Alaoui', lastMessage: 'Les documents douaniers sont-ils prêts ?', lastMessageAt: '2024-12-05T11:00:00', unreadCount: 1 },
  { id: 'conv6', clientId: 'u8', clientName: 'Marco Rossi', lastMessage: 'Quando sarà disponibile il BL?', lastMessageAt: '2024-10-16T09:45:00', unreadCount: 0 },
];

export const messages: Message[] = [
  // Conv 1 - Karim
  { id: 'm1', conversationId: 'conv1', senderId: 'u2', senderName: 'Karim El Fassi', senderRole: 'client', content: 'Bonjour, je voudrais savoir où en est ma commande BK-2024-0001.', read: true, createdAt: '2024-08-15T09:00:00' },
  { id: 'm2', conversationId: 'conv1', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'Bonjour Karim, votre expédition est actuellement en transit. Le navire CMA CGM Marco Polo a passé le détroit de Malacca.', read: true, createdAt: '2024-08-15T09:30:00' },
  { id: 'm3', conversationId: 'conv1', senderId: 'u2', senderName: 'Karim El Fassi', senderRole: 'client', content: 'Merci ! Quand est prévue l\'arrivée à Casablanca ?', read: true, createdAt: '2024-08-15T10:00:00' },
  { id: 'm4', conversationId: 'conv1', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'L\'ETA est le 5 septembre. Vous recevrez une notification dès l\'arrivée au port.', read: true, createdAt: '2024-08-15T10:15:00' },
  { id: 'm5', conversationId: 'conv1', senderId: 'u2', senderName: 'Karim El Fassi', senderRole: 'client', content: 'Aussi, j\'ai une nouvelle demande pour du tissu depuis Istanbul. Je vais soumettre le formulaire.', read: true, createdAt: '2024-10-20T15:00:00' },
  { id: 'm6', conversationId: 'conv1', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'Parfait, nous traiterons votre demande rapidement.', read: true, createdAt: '2024-10-20T15:30:00' },
  { id: 'm7', conversationId: 'conv1', senderId: 'u2', senderName: 'Karim El Fassi', senderRole: 'client', content: 'D\'accord, merci pour la mise à jour.', read: true, createdAt: '2024-10-20T16:30:00' },
  // Conv 2 - Sophie
  { id: 'm8', conversationId: 'conv2', senderId: 'u3', senderName: 'Sophie Martin', senderRole: 'client', content: 'Bonjour, ma cargaison d\'agrumes est arrivée à Anvers ?', read: true, createdAt: '2024-11-16T08:00:00' },
  { id: 'm9', conversationId: 'conv2', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'Oui Sophie, le navire est arrivé le 15 novembre. Le dédouanement est en cours.', read: true, createdAt: '2024-11-16T08:30:00' },
  { id: 'm10', conversationId: 'conv2', senderId: 'u3', senderName: 'Sophie Martin', senderRole: 'client', content: 'Pouvez-vous m\'envoyer le connaissement ?', read: false, createdAt: '2024-11-18T10:15:00' },
  // Conv 3 - Ahmed
  { id: 'm11', conversationId: 'conv3', senderId: 'u4', senderName: 'Ahmed Tazi', senderRole: 'client', content: 'Bonjour, mon expédition de matériaux est arrivée à Tanger Med ?', read: true, createdAt: '2024-11-28T13:00:00' },
  { id: 'm12', conversationId: 'conv3', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'Oui, le conteneur est au port. Nous préparons le dédouanement.', read: true, createdAt: '2024-11-28T13:30:00' },
  { id: 'm13', conversationId: 'conv3', senderId: 'u4', senderName: 'Ahmed Tazi', senderRole: 'client', content: 'La livraison est prévue pour quand ?', read: false, createdAt: '2024-11-28T14:00:00' },
  // Conv 4 - Li Wei
  { id: 'm14', conversationId: 'conv4', senderId: 'u5', senderName: 'Li Wei', senderRole: 'client', content: 'Hello, can I get an update on shipment SH-2024-0004?', read: true, createdAt: '2024-09-27T10:00:00' },
  { id: 'm15', conversationId: 'conv4', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'Hi Li Wei, the vessel is currently passing through the Suez Canal. ETA to Rotterdam remains October 10.', read: true, createdAt: '2024-09-27T10:30:00' },
  { id: 'm16', conversationId: 'conv4', senderId: 'u5', senderName: 'Li Wei', senderRole: 'client', content: 'Shipment tracking shows Suez canal. ETA still valid?', read: true, createdAt: '2024-09-28T08:30:00' },
  // Conv 5 - Fatima
  { id: 'm17', conversationId: 'conv5', senderId: 'u6', senderName: 'Fatima Zahra Alaoui', senderRole: 'client', content: 'Bonjour, mon équipement médical est parti de Singapour ?', read: true, createdAt: '2024-12-02T09:00:00' },
  { id: 'm18', conversationId: 'conv5', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'Oui Fatima, le conteneur est en route. ETA le 20 décembre à Casablanca.', read: true, createdAt: '2024-12-02T09:30:00' },
  { id: 'm19', conversationId: 'conv5', senderId: 'u6', senderName: 'Fatima Zahra Alaoui', senderRole: 'client', content: 'Les documents douaniers sont-ils prêts ?', read: false, createdAt: '2024-12-05T11:00:00' },
  // Conv 6 - Marco
  { id: 'm20', conversationId: 'conv6', senderId: 'u8', senderName: 'Marco Rossi', senderRole: 'client', content: 'Buongiorno, la mia prenotazione BK-2024-0007 è stata approvata?', read: true, createdAt: '2024-10-15T10:00:00' },
  { id: 'm21', conversationId: 'conv6', senderId: 'u1', senderName: 'Mohamed Bennani', senderRole: 'admin', content: 'Bonjour Marco, oui votre réservation a été approuvée. Le contrat de transport sera envoyé aujourd\'hui.', read: true, createdAt: '2024-10-15T10:30:00' },
  { id: 'm22', conversationId: 'conv6', senderId: 'u8', senderName: 'Marco Rossi', senderRole: 'client', content: 'Quando sarà disponibile il BL?', read: true, createdAt: '2024-10-16T09:45:00' },
];
