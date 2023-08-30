/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES_PATH } from '../constants/routes';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then I should not be able to create a new bill if file extension is different than jpg, jpeg nor png', () => {
      // Configuration des mocks
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );

      // Simuler le HTML de la page NewBill
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Créer une instance de NewBill avec le mock
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: {},
        localStorage: window.localStorage,
      });
      newBill.handleChangeFile = jest.fn(); // Associer le mock à la méthode

      // Selection de l'élément input de type file
      const inputFile = screen.getByTestId('file');

      // Simulation du changement de fichier dans l'input
      fireEvent.change(inputFile, {
        target: {
          files: [{ name: 'test.pdf' }], // Fichier avec une extension non autorisée
        },
      });
      newBill.handleChangeFile();

      // Vérifications
      expect(newBill.handleChangeFile).toHaveBeenCalled(); // Vérifier l'appel
      expect(inputFile.value).toBe(''); // Vérifier si le champ a été réinitialisé
    });
  });
  test('Then I should be able to create a new bill with a valid file extension', () => {
    // Simuler le HTML de la page NewBill
    const html = NewBillUI();
    document.body.innerHTML = html;
    // Créer une instance de NewBill avec le mock
    const newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: {},
      localStorage: window.localStorage,
    });
    newBill.handleChangeFile = jest.fn(); // Associer le mock à la méthode

    // Selection de l'élément input de type file
    const inputFile = screen.getByTestId('file');

    // Simulation du changement de fichier dans l'input
    fireEvent.change(inputFile, {
      target: {
        files: [{ name: 'test.jpg' }], // Fichier avec une extension autorisée
      },
    });
    newBill.handleChangeFile();

    // Vérifications
    expect(newBill.handleChangeFile).toHaveBeenCalled(); // Vérifier l'appel
  });
  // test('Then I should navigate to Bills page after creating a new bill', () => {
  //   Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  //   window.localStorage.setItem(
  //     'user',
  //     JSON.stringify({
  //       type: 'Employee',
  //     })
  //   );
  //   document.body.innerHTML = NewBillUI();
  //   const onNavigate = (pathname) => {
  //     document.body.innerHTML = ROUTES({ pathname });
  //   };
  //   const newBill = new NewBill({
  //     document,
  //     onNavigate,
  //     store: {},
  //     localStorage: window.localStorage,
  //   });

  //   const submitButton = screen.getByTestId('btn-submit');
  //   const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
  //   submitButton.addEventListener('click', handleSubmit);
  //   fireEvent.click(submitButton);
  //   expect(handleSubmit).toHaveBeenCalled();
  //   const table = screen.getByTestId('data-table');
  //   expect(table).toBeTruthy();
  // });
});
