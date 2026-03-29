-- Tabela para armazenar conversas do Assistente Carro
CREATE TABLE IF NOT EXISTS car_assistant_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  patientId INT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  audioUrl VARCHAR(500),
  duration INT, -- duração em segundos
  sentiment VARCHAR(50), -- positive, negative, neutral
  topic VARCHAR(100), -- tópico detectado
  dataSource VARCHAR(100), -- fonte de dados (universal_database_search, etc)
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (patientId) REFERENCES patients(id),
  INDEX idx_userId (userId),
  INDEX idx_patientId (patientId),
  INDEX idx_createdAt (createdAt)
);

-- Tabela para armazenar recomendações geradas
CREATE TABLE IF NOT EXISTS car_assistant_recommendations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  recommendationType VARCHAR(50), -- appointment, followup, technique, etc
  recommendationText TEXT NOT NULL,
  actionTaken BOOLEAN DEFAULT FALSE,
  actionDate TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES car_assistant_conversations(id),
  INDEX idx_conversationId (conversationId),
  INDEX idx_actionTaken (actionTaken)
);

-- Tabela para armazenar agendamentos feitos pelo Assistente Carro
CREATE TABLE IF NOT EXISTS car_assistant_appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  patientId INT NOT NULL,
  userId INT NOT NULL,
  requestedDate DATE,
  requestedTime TIME,
  confirmedDate DATE,
  confirmedTime TIME,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES car_assistant_conversations(id),
  FOREIGN KEY (patientId) REFERENCES patients(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_status (status),
  INDEX idx_requestedDate (requestedDate)
);
