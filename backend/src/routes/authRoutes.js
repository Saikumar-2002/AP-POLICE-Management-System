import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConfig from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const db = dbConfig.db;

router.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      unit_id: user.unit_id
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'super-secret-police-hierarchy-key-for-jwt-signing', {
      expiresIn: '24h'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        unit_id: user.unit_id,
        avatar_url: user.avatar_url
      }
    });

  } catch (err) {
    next(err);
  }
});

// Update profile (currently just avatar)
router.put('/profile', authenticate, (req, res, next) => {
  try {
    const { avatar_url } = req.body;
    const userId = req.user.id;

    db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(avatar_url, userId);
    
    const updatedUser = db.prepare('SELECT id, username, name, role, unit_id, avatar_url FROM users WHERE id = ?').get(userId);
    
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
});

export default router;
