# predict_energy.py
import sys
import numpy as np
from sklearn.linear_model import LinearRegression

# Example training data (hour of day vs energy usage)
X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]])
y = np.array([1.2, 1.5, 1.7, 2.0, 2.3, 2.6, 2.9, 3.1, 3.3, 3.5])

# Get hour from backend
hour = float(sys.argv[1])

# Fit the model
model = LinearRegression()
model.fit(X, y)

# Predict
prediction = model.predict([[hour]])
print(prediction[0])
