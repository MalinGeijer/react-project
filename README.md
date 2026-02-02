# Full-Stack Web Application with Machine Learning

A full-stack project with a React client and a Flask server.
The Flask backend provides a REST API and handles machine learning inference,
while the React client serves as the user interface.


## Prerequisites

The project consists of a React client and a Python Flask server.
Make sure the following tools are installed:

- **Node.js** 18 or newer

  Required to run and build the React application.

- **npm** (included with Node.js)

  Used for managing frontend dependencies.

- **Python** 3.10 over newer

  Required to run the Flask backend.

- **pip**

  Python package manager

## Pretrained Models and Training from Scratch

The project includes pretrained machine learning models that can be used
directly by the Flask backend for inference.

If you want to train the models yourself, a training script is provided.
The script supports multiple model types and allows you to control training
parameters via command-line arguments.

### Train a Model

You can see all available options, including model types and default
parameters, by running:
```bash
python -m src.train_model -h
```
from the `python-server` directory


## Environment variables

To be able to login as an administator, create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

## Installation and start
Open a terminal and run:

```bash
git clone https://github.com/MalinGeijer/react-project.git
cd react-project/python-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m src.main
```

Open a new terminal and run:

```bash
cd react-project/client
npm install
npm run dev
```
Open http://localhost:5173/ in a browser

Go to the Play page and follow the directions


