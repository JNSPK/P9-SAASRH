/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';

import router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    });
    test('Then bills should be ordered from earliest to latest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test('Then clicking the new bill button should navigate to NewBill route', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('btn-new-bill'));

      // Simulate clicking the new bill button
      const newBillButton = screen.getByTestId('btn-new-bill');
      fireEvent.click(newBillButton);

      // Check if the navigation happened as expected
      expect(window.location.href).toContain(ROUTES_PATH.NewBill);
    });
    test('Then clicking the eye icon should open a modal', async () => {
      // Set up the environment
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getAllByTestId('icon-eye'));

      // Simulate clicking the eye icon
      const eyeIcon = screen.getAllByTestId('icon-eye');
      fireEvent.click(eyeIcon[0]);

      // Check if the modal was opened
      const modalElement = document.getElementById('modaleFile');
      expect(modalElement).not.toBeNull();
    });

    //Test d'intégration GET

    describe('When I navigate to Bills Page', () => {
      test('fetches bills from mock API GET', async () => {
        localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.Bills);

        // Attendre que le contenu des factures soit affiché
        await waitFor(async () => {
          // Récupérer le titre de la table
          const tableTitle = screen.getByText('Mes notes de frais');

          // Vérification
          expect(tableTitle).toBeTruthy();
        });
      });

      describe('When an error occurs on API', () => {
        beforeEach(() => {
          jest.spyOn(mockStore, 'bills');
          Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            'user',
            JSON.stringify({
              type: 'Employee',
            })
          );
          const root = document.createElement('div');
          root.setAttribute('id', 'root');
          document.body.appendChild(root);
          router();
        });

        test('fetches bills from an API and fails with message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 404'));
              },
            };
          });
          window.onNavigate(ROUTES_PATH.Bills);
          await new Promise(process.nextTick);
          const errorMessage = await screen.getByText(/Erreur/);
          expect(errorMessage).toBeTruthy();
        });

        test('fetches bills from an API and fails with 500 message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 500'));
              },
            };
          });
          window.onNavigate(ROUTES_PATH.Bills);
          await new Promise(process.nextTick);
          const errorMessage = await screen.getByText(/Erreur/);
          expect(errorMessage).toBeTruthy();
        });
      });
    });
  });
});
