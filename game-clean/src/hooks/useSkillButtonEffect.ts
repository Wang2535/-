/**
 * 技能按钮特效Hook
 * 
 * 功能：
 * 1. 为技能按钮添加金色光辉特效
 * 2. 特效持续3秒后自动移除
 * 3. 支持多个技能按钮同时触发特效
 */

import { useCallback, useRef, useEffect } from 'react';

interface SkillButtonRef {
  element: HTMLElement | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

export function useSkillButtonEffect() {
  const buttonRefs = useRef<Map<string, SkillButtonRef>>(new Map());

  // 注册技能按钮元素
  const registerSkillButton = useCallback((skillId: string, element: HTMLElement | null) => {
    if (!element) {
      buttonRefs.current.delete(skillId);
      return;
    }

    // 添加基础样式类
    element.classList.add('skill-button');

    buttonRefs.current.set(skillId, {
      element,
      timeoutId: null,
    });
  }, []);

  // 触发技能特效
  const triggerSkillEffect = useCallback((skillId: string) => {
    const buttonRef = buttonRefs.current.get(skillId);
    if (!buttonRef || !buttonRef.element) {
      console.warn(`Skill button not found: ${skillId}`);
      return;
    }

    const { element, timeoutId } = buttonRef;

    // 清除之前的定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 移除之前的特效类
    element.classList.remove('skill-active');

    // 强制重绘以确保动画重新触发
    void element.offsetWidth;

    // 添加特效类
    element.classList.add('skill-active');

    // 3秒后移除特效类
    const newTimeoutId = setTimeout(() => {
      element.classList.remove('skill-active');
      const ref = buttonRefs.current.get(skillId);
      if (ref) {
        ref.timeoutId = null;
      }
    }, 3000);

    // 更新引用
    buttonRefs.current.set(skillId, {
      element,
      timeoutId: newTimeoutId,
    });
  }, []);

  // 清理所有特效
  const clearAllEffects = useCallback(() => {
    buttonRefs.current.forEach((ref) => {
      if (ref.timeoutId) {
        clearTimeout(ref.timeoutId);
      }
      if (ref.element) {
        ref.element.classList.remove('skill-active');
      }
    });
    buttonRefs.current.clear();
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAllEffects();
    };
  }, [clearAllEffects]);

  return {
    registerSkillButton,
    triggerSkillEffect,
    clearAllEffects,
  };
}

export default useSkillButtonEffect;
