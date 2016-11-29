import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

driver = webdriver.Chrome('/usr/bin/chromedriver')
driver.set_window_size(1120, 1120)

class TestIntroduction(unittest.TestCase):
    def setUp(self):
        driver.implicitly_wait(1)

    def test_url(self):
        driver.get("http://localhost:4001/")
        self.assertEqual('Welcome back to Sagebow.' in driver.page_source, True)
        self.assertEqual('Enter your username' in driver.page_source, True)
        self.assertEqual('Enter your password' in driver.page_source, True)
        self.assertEqual('Login' in driver.page_source, True)
        self.assertEqual('Create a new account' in driver.page_source, True)

    def test_no_data(self):
        driver.get("http://localhost:4001/")
        driver.find_element_by_class_name('btn-login').click()
        self.assertEqual('Oops' in driver.page_source, True)

    def test_transition_to_setup(self):
        driver.get("http://localhost:4001/")
        driver.find_element_by_class_name('btn-make-account').click()
        self.assertEqual('Sign Up' in driver.page_source, True)
           
if __name__ == '__main__':
    unittest.main()
