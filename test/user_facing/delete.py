import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys

driver = webdriver.Chrome('/usr/bin/chromedriver')
driver.set_window_size(1440, 900)
driver.set_window_position(0, 0)

def ui_wait():
    time.sleep(0.4)
    

class TestDelete(unittest.TestCase):
    def setUp(self):
        driver.implicitly_wait(.5)
        driver.get("http://localhost:4001/login")
        name = driver.find_element_by_id('username')
        password = driver.find_element_by_id('password')
        name.send_keys("boston");
        password.send_keys("password1");
        driver.find_element_by_class_name('btn-login').click()
        ui_wait()

    def test_accessable_on_entry(self):
        self.assertEqual('<a id="delete-button" href="delete"> Delete Your Account </a>' in driver.page_source, True)
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        self.assertEqual('Account Deletion' in driver.page_source, True)

    def test_accessable_on_metrics(self):
        driver.find_element_by_id('metrics-button').click()
        ui_wait()
        self.assertEqual('<a id="delete-button" href="delete"> Delete Your Account </a>' in driver.page_source, True)
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        self.assertEqual('Account Deletion' in driver.page_source, True)

    def test_navigate_back(self):
        driver.find_element_by_id('delete-button').click()
        ui_wait()
        driver.find_element_by_class_name('logo').click()
        ui_wait()
        self.assertEqual('Data Entry' in driver.page_source, True)

if __name__ == '__main__':
    unittest.main()
