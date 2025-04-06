#!/bin/bash
echo "Resetting view data..."
curl -X POST http://localhost:5000/api/reset-views
echo -e "\nDone!"
