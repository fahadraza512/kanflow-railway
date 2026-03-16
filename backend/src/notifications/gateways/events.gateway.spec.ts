import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsGateway } from './events.gateway';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsGateway,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('subscribe', () => {
    it('should subscribe to an event', () => {
      const callback = jest.fn();
      const eventName = 'test:event';

      const unsubscribe = gateway.subscribe(eventName, callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const callback = jest.fn();
      const eventName = 'test:event';

      const unsubscribe = gateway.subscribe(eventName, callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should allow multiple subscriptions to same event', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventName = 'test:event';

      gateway.subscribe(eventName, callback1);
      gateway.subscribe(eventName, callback2);

      const count = gateway.getSubscriberCount(eventName);

      expect(count).toBe(2);
    });
  });

  describe('emit', () => {
    it('should emit event to all subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventName = 'test:event';
      const data = { message: 'test' };

      gateway.subscribe(eventName, callback1);
      gateway.subscribe(eventName, callback2);

      gateway.emit(eventName, data);

      expect(callback1).toHaveBeenCalledWith(data);
      expect(callback2).toHaveBeenCalledWith(data);
    });

    it('should not emit to unsubscribed callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventName = 'test:event';
      const data = { message: 'test' };

      const unsubscribe = gateway.subscribe(eventName, callback1);
      gateway.subscribe(eventName, callback2);

      unsubscribe();

      gateway.emit(eventName, data);

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledWith(data);
    });

    it('should handle errors in callbacks gracefully', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = jest.fn();
      const eventName = 'test:event';
      const data = { message: 'test' };

      gateway.subscribe(eventName, errorCallback);
      gateway.subscribe(eventName, normalCallback);

      expect(() => gateway.emit(eventName, data)).not.toThrow();
      expect(normalCallback).toHaveBeenCalledWith(data);
    });

    it('should not emit to non-existent event', () => {
      const callback = jest.fn();
      const eventName = 'test:event';
      const data = { message: 'test' };

      gateway.emit(eventName, data);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('getSubscriberCount', () => {
    it('should return correct subscriber count', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventName = 'test:event';

      gateway.subscribe(eventName, callback1);
      gateway.subscribe(eventName, callback2);

      const count = gateway.getSubscriberCount(eventName);

      expect(count).toBe(2);
    });

    it('should return 0 for non-existent event', () => {
      const count = gateway.getSubscriberCount('non:existent');

      expect(count).toBe(0);
    });

    it('should update count after unsubscribe', () => {
      const callback = jest.fn();
      const eventName = 'test:event';

      const unsubscribe = gateway.subscribe(eventName, callback);

      expect(gateway.getSubscriberCount(eventName)).toBe(1);

      unsubscribe();

      expect(gateway.getSubscriberCount(eventName)).toBe(0);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe from event', () => {
      const callback = jest.fn();
      const eventName = 'test:event';

      const unsubscribe = gateway.subscribe(eventName, callback);

      expect(gateway.getSubscriberCount(eventName)).toBe(1);

      unsubscribe();

      expect(gateway.getSubscriberCount(eventName)).toBe(0);
    });

    it('should not affect other subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const eventName = 'test:event';

      const unsubscribe1 = gateway.subscribe(eventName, callback1);
      gateway.subscribe(eventName, callback2);

      unsubscribe1();

      expect(gateway.getSubscriberCount(eventName)).toBe(1);
    });
  });
});
