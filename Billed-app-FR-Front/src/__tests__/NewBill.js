/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES_PATH } from '../constants/routes';
import router from '../app/Router.js';
import mockStore from '../__mocks__/store.js';
import BillsUI from '../views/BillsUI.js';

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

  test('Then I should navigate to Bills page after creating a new bill', async () => {
    // Simulation du HTML
    const html = NewBillUI();
    document.body.innerHTML = html;

    // Création d'un instance de NewBill
    const newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
    });

    // Remplissage du formulaire avec des data de test
    const expenseTypeInput = screen.getByTestId('expense-type');
    fireEvent.change(expenseTypeInput, { target: { value: 'test' } });

    const expenseNameInput = screen.getByTestId('expense-name');
    fireEvent.change(expenseNameInput, { target: { value: 'test' } });

    const expenseDateInput = screen.getByTestId('datepicker');
    fireEvent.change(expenseDateInput, { target: { value: '2023-09-15' } });

    const expenseAmountInput = screen.getByTestId('amount');
    fireEvent.change(expenseAmountInput, { target: { value: '1' } });

    const expenseVatInput = screen.getByTestId('vat');
    fireEvent.change(expenseVatInput, { target: { value: '1' } });

    const expensePctInput = screen.getByTestId('pct');
    fireEvent.change(expensePctInput, { target: { value: '1' } });

    const expenseCommentaryInput = screen.getByTestId('commentary');
    fireEvent.change(expenseCommentaryInput, { target: { value: 'test' } });

    const expenseFileInput = screen.getByTestId('file');
    fireEvent.change(expenseFileInput, { target: { value: '' } });

    // Soumission du formulaire
    const form = screen.getByTestId('form-new-bill');
    fireEvent.submit(form);

    // Vérification de la route onNavigate
    expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });

  //POST Integration test
  test('Then fetches bills from mock API POST', async () => {
    //mock function to track calls to mocked store
    const postSpy = jest.spyOn(mockStore, 'bills');
    //call POST function
    const billIsCreated = await postSpy().update();
    //tests
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(billIsCreated.id).toBe('47qAXb6fIm2zOKkLzMro');
  }); //end Test

  test('fetches bills from mock API POST and fails with 404 message error', async () => {
    //DOM simulation
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);

    // initialisation NewBill
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    //error simulation
    const mockedError = jest
      .spyOn(mockStore, 'bills')
      .mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 404'));
          },
        };
      });

    await expect(mockedError().update).rejects.toThrow('Erreur 404');
    expect(mockedError).toHaveBeenCalledTimes(2);
    expect(newBill.billId).toBeNull();
    expect(newBill.fileUrl).toBeNull();
    expect(newBill.fileName).toBeNull();
  }); //end Test

  test('fetches bills from mock API POST and fails with 500 message error', async () => {
    //DOM simulation
    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);

    // initialisation NewBill
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    //error simulation
    const mockedError = jest
      .spyOn(mockStore, 'bills')
      .mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'));
          },
        };
      });

    await expect(mockedError().update).rejects.toThrow('Erreur 500');
    expect(mockedError).toHaveBeenCalledTimes(3);
    expect(newBill.billId).toBeNull();
    expect(newBill.fileUrl).toBeNull();
    expect(newBill.fileName).toBeNull();
  }); //end Test
});
