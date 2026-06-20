import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { userModel } from './models/user.js';
import { connectdb } from './db.js';
import { orgModel } from './models/org.js';
import { authMiddleware } from './middleware.js';
import { issueModel } from './models/issue.js';
import { boardModel } from './models/boards.js';
import {
  boardSchema,
  issueSchema,
  orgnaizationSchema,
  SigninSchema,
  SignupSchema,
} from './validator.js';

const secret = process.env.JWT_SECRET;

connectdb('mongodb://localhost:27017/trello')
  .then(() => console.log('Mongodb is connected.'))
  .catch((err) => console.error(err));

const app = express();
app.use(express.json());
const PORT = 8001;

app.post('/signup', async (req, res) => {
  const { data, success } = SignupSchema.safeParse(req.body);

  if (!success) {
    res.json({ message: 'Invalid Input' });
    return;
  }

  const { username, password } = data;

  const userExist = await userModel.findOne({
    username,
  });

  if (userExist) {
    return res.status(400).json({ message: 'username already exists' });
  }

  const user = await userModel.create({
    username,
    password,
  });

  const result = await userModel.findById(user._id).select('-password');

  res.status(201).json({ message: 'singup successful', result });
});

app.post('/signin', async (req, res) => {
  const { data, success } = SigninSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({ message: 'inavlid input' });
  }

  const { username, password } = data;

  const userExist = await userModel.findOne({ username, password });

  if (!userExist) {
    res.status(400).json({ message: 'Wrong Credentials.' });
  }
  const token = jwt.sign(
    {
      id: userExist._id,
    },
    secret,
  );

  res.json({ message: 'User Signed In!', token });
});

app.post('/organizations', authMiddleware, async (req, res) => {
  const userId = req.userId;

  const { data, success } = orgnaizationSchema.safeParse(req.body);

  if (!success) {
    return res.json({ message: 'Invalid Input' });
  }

  const { title, description } = data;

  const newOrg = await orgModel.create({
    title,
    description,
    admin: userId,
    members: [],
  });
  res.json({
    message: 'Org created',
    id: newOrg._id,
  });
});

app.post('/add-member', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const organizationId = req.body.organizationId;
  const memberUsername = req.body.memberUsername;

  const organization = await orgModel.findOne({
    _id: organizationId,
  });
  if (!organization || organization.admin.toString() !== userId.toString()) {
    res.status(403).json({
      message:
        'Either this org doesnt exist or you are not an admin of this org',
    });
    return;
  }

  if (!memberUser) {
    res.status(400).json({
      message: 'No user with this username exists in our db',
    });
    return;
  }
  organization.members.push(memberUser._id);
  await organization.save();

  res.json({
    message: 'New member added!',
  });
});

app.post('/board', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { data, success } = boardSchema.safeParse(req.body);

  if (!success) {
    return res.json({ message: 'Invalid Input' });
  }

  const { title, description, organizationId } = data;

  const organization = await orgModel.findOne({ _id: organizationId });

  if (!organization) {
    return res.status(404).json({ message: 'Organization not found' });
  }
  const isMember =
    organization.admin.toString() === userId.toString() ||
    organization.members.some((m) => m.toString() === userId.toString());

  if (!isMember) {
    return res
      .status(403)
      .json({ message: 'You are not a member of this organization' });
  }
  const newBoard = await boardModel.create({
    title,
    description,
    organizationId,
    createdBy: userId,
  });

  res.json({ message: 'Board created', id: newBoard._id });
});

app.post('/issue', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { data, success } = issueSchema.safeParse(req.body);

  if (!success) {
    return res.json({ message: 'Invalid Input' });
  }

  const { title, description, assignedTo, boardId } = data;

  const board = await boardModel.findOne({ _id: boardId });

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }

  const newIssue = await issueModel.create({
    title,
    description,
    boardId,
    createdBy: userId,
    assignedTo: assignedTo || null,
    status: 'todo',
  });

  res.json({ message: 'Issue created', id: newIssue._id });
});

app.get('/organizations', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const organizationId = req.query.organizationId;

  const organization = await organizationModel.findOne({ _id: organizationId });

  if (!organization || organization.admin.toString() !== userId) {
    return res.status(411).json({
      message:
        'Either this org doesnt exist or you are not an admin of this org',
    });
  }

  const members = await userModel.find({ _id: organization.members });

  res.json({
    organization: {
      title: organization.title,
      description: organization.description,
      members: members.map((m) => ({ username: m.username, id: m._id })),
    },
  });
});

app.get('/boards', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { organizationId } = req.query;

  const organization = await orgModel.findOne({ _id: organizationId });

  if (!organization) {
    return res.status(404).json({ message: 'Organization not found' });
  }

  const isMember =
    organization.admin.toString() === userId.toString() ||
    organization.members.some((m) => m.toString() === userId.toString());

  if (!isMember) {
    return res
      .status(403)
      .json({ message: 'You are not a member of this organization' });
  }

  const boards = await boardModel.find({ organizationId });
  res.json({ boards });
});

app.get('/issues', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { boardId } = req.query;

  const board = await boardModel.findOne({ _id: boardId });

  if (!board) {
    return res.status(404).json({ message: 'Board not found' });
  }
  const organization = await orgModel.findOne({ _id: board.organizationId });

  const isMember =
    organization.admin.toString() === userId.toString() ||
    organization.members.some((m) => m.toString() === userId.toString());

  if (!isMember) {
    return res
      .status(403)
      .json({ message: 'You are not a member of this organization' });
  }

  const issues = await issueModel.find({ boardId });
  res.json({ issues });
});

app.get('/members', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { organizationId } = req.query;

  const organization = await orgModel.findOne({ _id: organizationId });

  if (!organization) {
    return res.status(404).json({ message: 'Organization not found' });
  }

  const isMember =
    organization.admin.toString() === userId.toString() ||
    organization.members.some((m) => m.toString() === userId.toString());

  if (!isMember) {
    return res
      .status(403)
      .json({ message: 'You are not a member of this organization' });
  }

  const members = await userModel.find({ _id: organization.members });

  res.json({
    members: members.map((m) => ({ id: m._id, username: m.username })),
  });
});

app.put('/issues', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { issueId, title, description, status, assignedTo } = req.body;

  const issue = await issueModel.findOne({ _id: issueId });

  if (!issue) {
    return res.status(404).json({ message: 'Issue not found' });
  }

  const board = await boardModel.findOne({ _id: issue.boardId });
  const organization = await orgModel.findOne({ _id: board.organizationId });

  const isMember =
    organization.admin.toString() === userId.toString() ||
    organization.members.some((m) => m.toString() === userId.toString());

  if (!isMember) {
    return res
      .status(403)
      .json({ message: 'You are not a member of this organization' });
  }

  if (title !== undefined) issue.title = title;
  if (description !== undefined) issue.description = description;
  if (status !== undefined) issue.status = status;
  if (assignedTo !== undefined) issue.assignedTo = assignedTo;

  await issue.save();
  res.json({ message: 'Issue updated', issue });
});

app.delete('/members', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const organizationId = req.body.organizationId;
  const memberUsername = req.body.memberUsername;

  const organization = await orgModel.findOne({ _id: organizationId });

  if (!organization || organization.admin.toString() !== userId.toString()) {
    return res.status(411).json({
      message:
        'Either this org doesnt exist or you are not an admin of this org',
    });
  }

  const memberUser = await userModel.findOne({ username: memberUsername });

  if (!memberUser) {
    return res
      .status(411)
      .json({ message: 'No user with this username exists in our db' });
  }

  organization.members = organization.members.filter(
    (x) => x.toString() !== memberUser._id.toString(),
  );
  await organization.save();

  res.json({ message: 'member deleted!' });
});

app.listen(PORT, () => console.log('Server Started at port 8001.'));
