# API Testing Guide

This directory contains unit tests for the MatchStudy API.

## Prerequisites

Ensure you have installed all the required dependencies:

```bash
pip install -r requirements.txt
```

## Running Tests

To run the tests, execute the following command from the project root:

```bash
pytest backend/tests
```

To generate a coverage report:

```bash
pytest --cov=backend backend/tests
```

## Test Structure

- `conftest.py` - Contains pytest fixtures and setup
- `test_profiles.py` - Tests for profile-related endpoints
- Additional test files for other endpoints

## Test Examples

Each set of tests demonstrates:

1. **POST** - Creating a new resource
2. **GET** - Retrieving a resource or resources
3. **PUT** - Updating an existing resource
4. **DELETE** - Removing a resource

The tests use mocking to isolate the API layer from the database. 