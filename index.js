// test.js - Weather Application Tests

// Mock fetch for testing
global.fetch = jest.fn();

// Mock DOM elements
document.body.innerHTML = `
    <input id="city-input" type="text">
    <button id="get-weather">Get Weather</button>
    <div id="error-message" style="display: none;"></div>
    <div id="weather-display" style="display: none;">
        <h2 id="city-name"></h2>
        <span id="temperature"></span>
        <span id="humidity"></span>
        <span id="description"></span>
    </div>
`;

// Import functions (assuming they're exported from index.js)
const { fetchWeatherData, displayWeather, displayError } = require('./index.js');

describe('Weather Application Tests', () => {
    
    beforeEach(() => {
        // Clear all mocks before each test
        fetch.mockClear();
        
        // Reset DOM
        document.getElementById('error-message').style.display = 'none';
        document.getElementById('error-message').innerText = '';
        document.getElementById('weather-display').style.display = 'none';
    });

    // Test Suite 1: Successful API Calls and Data Retrieval
    describe('Successful API Calls', () => {
        
        test('fetchWeatherData should successfully fetch data for valid city', async () => {
            const mockData = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 15, humidity: 70 },
                weather: [{ description: 'cloudy' }]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockData
            });

            const data = await fetchWeatherData('London');
            
            expect(data).toEqual(mockData);
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('London')
            );
        });

        test('fetchWeatherData should handle city names with spaces', async () => {
            const mockData = {
                name: 'New York',
                sys: { country: 'US' },
                main: { temp: 20, humidity: 60 },
                weather: [{ description: 'sunny' }]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockData
            });

            const data = await fetchWeatherData('New York');
            
            expect(data).toEqual(mockData);
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('New%20York')
            );
        });
    });

    // Test Suite 2: Invalid Input Handling
    describe('Invalid Input Handling', () => {
        
        test('fetchWeatherData should throw error for empty input', async () => {
            await expect(fetchWeatherData('')).rejects.toThrow('Please enter a city name.');
        });

        test('fetchWeatherData should throw error for whitespace-only input', async () => {
            await expect(fetchWeatherData('   ')).rejects.toThrow('Please enter a city name.');
        });

        test('fetchWeatherData should throw error for null input', async () => {
            await expect(fetchWeatherData(null)).rejects.toThrow('Please enter a city name.');
        });

        test('fetchWeatherData should throw error for undefined input', async () => {
            await expect(fetchWeatherData(undefined)).rejects.toThrow('Please enter a city name.');
        });
    });

    // Test Suite 3: Failed API Responses
    describe('Failed API Responses', () => {
        
        test('fetchWeatherData should handle 404 error for non-existent city', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ message: 'city not found' })
            });

            await expect(fetchWeatherData('InvalidCityName123'))
                .rejects.toThrow('City not found. Please check the city name.');
        });

        test('fetchWeatherData should handle 401 error for invalid API key', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({ message: 'Invalid API key' })
            });

            await expect(fetchWeatherData('London'))
                .rejects.toThrow('Invalid API key. Please check your configuration.');
        });

        test('fetchWeatherData should handle network errors', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(fetchWeatherData('London'))
                .rejects.toThrow('Network error');
        });

        test('fetchWeatherData should handle generic server errors', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ message: 'Internal server error' })
            });

            await expect(fetchWeatherData('London'))
                .rejects.toThrow('Failed to fetch weather data. Please try again.');
        });
    });

    // Test Suite 4: DOM Updates
    describe('DOM Updates for Weather Display', () => {
        
        test('displayWeather should correctly update DOM with weather data', () => {
            const mockData = {
                name: 'Paris',
                sys: { country: 'FR' },
                main: { temp: 18, humidity: 65 },
                weather: [{ description: 'partly cloudy' }]
            };

            displayWeather(mockData);

            expect(document.getElementById('city-name').textContent).toBe('Paris, FR');
            expect(document.getElementById('temperature').textContent).toContain('18°C');
            expect(document.getElementById('humidity').textContent).toBe('65%');
            expect(document.getElementById('description').textContent).toBe('Partly cloudy');
            expect(document.getElementById('weather-display').style.display).toBe('block');
            expect(document.getElementById('error-message').style.display).toBe('none');
        });

        test('displayWeather should hide error messages when displaying data', () => {
            // First show an error
            document.getElementById('error-message').style.display = 'block';
            document.getElementById('error-message').innerText = 'Some error';

            const mockData = {
                name: 'Tokyo',
                sys: { country: 'JP' },
                main: { temp: 22, humidity: 75 },
                weather: [{ description: 'rainy' }]
            };

            displayWeather(mockData);

            expect(document.getElementById('error-message').style.display).toBe('none');
            expect(document.getElementById('error-message').innerText).toBe('');
        });

        test('displayWeather should capitalize weather description', () => {
            const mockData = {
                name: 'Berlin',
                sys: { country: 'DE' },
                main: { temp: 12, humidity: 80 },
                weather: [{ description: 'light rain' }]
            };

            displayWeather(mockData);

            expect(document.getElementById('description').textContent).toBe('Light rain');
        });
    });

    // Test Suite 5: DOM Updates for Error Display
    describe('DOM Updates for Error Display', () => {
        
        test('displayError should show error message in DOM', () => {
            const errorMessage = 'City not found. Please check the city name.';
            
            displayError(errorMessage);

            expect(document.getElementById('error-message').style.display).toBe('block');
            expect(document.getElementById('error-message').innerText).toBe(errorMessage);
            expect(document.getElementById('weather-display').style.display).toBe('none');
        });

        test('displayError should hide weather display when showing error', () => {
            // First show weather
            document.getElementById('weather-display').style.display = 'block';

            displayError('Some error occurred');

            expect(document.getElementById('weather-display').style.display).toBe('none');
        });

        test('displayError should handle different error messages', () => {
            const errorMessages = [
                'Please enter a city name.',
                'Failed to fetch weather data. Please try again.',
                'Invalid API key. Please check your configuration.'
            ];

            errorMessages.forEach(message => {
                displayError(message);
                expect(document.getElementById('error-message').innerText).toBe(message);
            });
        });
    });

    // Test Suite 6: Asynchronous Handling
    describe('Asynchronous Handling', () => {
        
        test('fetchWeatherData should not have unhandled promise rejections for invalid city', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            try {
                await fetchWeatherData('InvalidCity');
            } catch (error) {
                expect(error.message).toBe('City not found. Please check the city name.');
            }
        });

        test('async errors should be properly caught and handled', async () => {
            fetch.mockRejectedValueOnce(new Error('Network timeout'));

            let caughtError = null;
            try {
                await fetchWeatherData('London');
            } catch (error) {
                caughtError = error;
            }

            expect(caughtError).not.toBeNull();
            expect(caughtError.message).toBe('Network timeout');
        });

        test('multiple concurrent requests should be handled properly', async () => {
            const mockData1 = {
                name: 'London',
                sys: { country: 'GB' },
                main: { temp: 15, humidity: 70 },
                weather: [{ description: 'cloudy' }]
            };

            const mockData2 = {
                name: 'Paris',
                sys: { country: 'FR' },
                main: { temp: 18, humidity: 65 },
                weather: [{ description: 'sunny' }]
            };

            fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockData1
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockData2
                });

            const [result1, result2] = await Promise.all([
                fetchWeatherData('London'),
                fetchWeatherData('Paris')
            ]);

            expect(result1.name).toBe('London');
            expect(result2.name).toBe('Paris');
        });
    });

    // Test Suite 7: Data Validation
    describe('Data Validation', () => {
        
        test('displayWeather should handle missing data gracefully', () => {
            const incompleteData = {
                name: 'TestCity',
                sys: { country: 'TC' },
                main: { temp: 10, humidity: 50 },
                weather: [{}] // Missing description
            };

            expect(() => displayWeather(incompleteData)).not.toThrow();
        });

        test('temperature conversion should be accurate', () => {
            const mockData = {
                name: 'TestCity',
                sys: { country: 'TC' },
                main: { temp: 0, humidity: 50 },
                weather: [{ description: 'freezing' }]
            };

            displayWeather(mockData);

            const tempText = document.getElementById('temperature').textContent;
            expect(tempText).toContain('0°C');
            expect(tempText).toContain('32°F');
        });
    });
});
